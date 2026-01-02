from django.shortcuts import render
from django.core.files.storage import FileSystemStorage
import os
from django.conf import settings
import pytesseract
from PIL import Image
import sympy
import re # Import regular expressions
import base64
from django.core.files.base import ContentFile

# --- Tesseract Configuration (Update this path if necessary!) ---
# IMPORTANT: Verify this path points to your Tesseract installation!
# If Tesseract is not in your PATH, uncomment and set the correct path
# For Windows: C:\Users\gm\AppData\Local\Programs\Tesseract-OCR
pytesseract.pytesseract.tesseract_cmd = r'C:\Users\gm\AppData\Local\Programs\Tesseract-OCR\tesseract.exe'
# For Linux/macOS (if installed in a non-standard location):C:\Program Files\Tesseract-OCR\tesseract.exe
# pytesseract.pytesseract.tesseract_cmd = r'/path/to/your/tesseract'
# ----------------------------------------------------------------

def perform_ocr(image_path):
    """Performs OCR on the image file at the given path."""
    try:
        # Use Pillow to open the image
        img = Image.open(image_path)
        # Use pytesseract to extract text - specify language if needed (e.g., lang='eng+equ')
        # 'equ' is for equation detection mode, might require additional training data
        # For simple cases, 'eng' might suffice.
        text = pytesseract.image_to_string(img, lang='eng', config='--psm 6') # PSM 6 assumes a single uniform block of text
        # Basic cleanup (remove extra whitespace)
        text = text.strip()
        # Replace common OCR errors for equations if needed (e.g., 'l' -> '1', 'O' -> '0')
        # text = text.replace('l', '1').replace('O', '0')
        return text
    except pytesseract.TesseractNotFoundError:
        raise RuntimeError("Tesseract is not installed or not in your PATH. Please configure the path in views.py.")
    except Exception as e:
        # Log the error e
        print(f"OCR Error: {e}")
        raise ValueError(f"Hiba történt a kép szövegének felismerése közben: {e}")

def step_by_step_linear_solve(equation_string):
    """Solves a linear equation step by step."""
    steps = []
    solution = None
    
    try:
        # Preprocessing: Ensure '*' for multiplication if missing between number and variable
        equation_string = re.sub(r'(\d)([a-zA-Z])', r'\1*\2', equation_string)
        
        # Check if we have a proper equation with equals sign
        if '=' not in equation_string:
            steps.append(f"A megadott kifejezés: {equation_string}")
            steps.append("Nem egyenlet, mert nincs egyenlőségjel (=).")
            expr = sympy.sympify(equation_string)
            steps.append(f"Kifejezés egyszerűsítve: {sympy.simplify(expr)}")
            return steps, None
        
        # Replace single equals with double for sympy comparison
        equation_string = equation_string.replace('=', '==', 1)
        
        # Split into left and right sides
        lhs_str, rhs_str = equation_string.split('==', 1)
        steps.append(f"Eredeti egyenlet: {lhs_str} = {rhs_str}")
        
        # Parse both sides with sympy
        lhs = sympy.sympify(lhs_str.strip())
        rhs = sympy.sympify(rhs_str.strip())
        
        # Define the variable - instead of trying to extract from the equation string
        # we'll use 'x' as the default variable for 6th grade math problems
        x = sympy.Symbol('x')
        
        # Check if our assumed variable 'x' is actually in the equation
        if x not in lhs.free_symbols and x not in rhs.free_symbols:
            # If 'x' isn't in the equation, try to find any other variable
            all_symbols = lhs.free_symbols.union(rhs.free_symbols)
            if not all_symbols:
                steps.append("Nem található változó az egyenletben.")
                return steps, None
            # Use the first symbol found if 'x' isn't present
            x = list(all_symbols)[0]
            
        # Step 1: Move all terms with x to the left side, all others to the right
        lhs_expanded = sympy.expand(lhs)
        rhs_expanded = sympy.expand(rhs)
        steps.append(f"Egyenlet kibontása: {lhs_expanded} = {rhs_expanded}")
        
        # Collect x terms and constant terms
        lhs_x_terms = sympy.collect(lhs_expanded, x)
        rhs_x_terms = sympy.collect(rhs_expanded, x)
        
        # Move all x terms to left, all constants to right
        x_coeff_left = sympy.Poly(lhs_expanded, x).coeff_monomial(x) if x in lhs_expanded.free_symbols else 0
        x_coeff_right = sympy.Poly(rhs_expanded, x).coeff_monomial(x) if x in rhs_expanded.free_symbols else 0
        
        const_left = lhs_expanded - x_coeff_left * x if x_coeff_left != 0 else lhs_expanded
        const_right = rhs_expanded - x_coeff_right * x if x_coeff_right != 0 else rhs_expanded
        
        # New equation: all x terms on left, all constants on right
        new_lhs = x_coeff_left * x - x_coeff_right * x
        new_rhs = const_right - const_left
        
        steps.append(f"Változókat a bal oldalra, konstansokat a jobb oldalra rendezzük:")
        steps.append(f"{new_lhs} = {new_rhs}")
        
        # Simplify coefficient of x
        x_coefficient = new_lhs/x if new_lhs != 0 else 0
        steps.append(f"Az {x} együtthatója: {x_coefficient}")
        
        # Final step: divide both sides by coefficient of x
        if x_coefficient == 0:
            if new_rhs == 0:
                steps.append(f"Az egyenlet azonosság: bármely {x} érték megoldás.")
                solution = f"Bármely {x} érték"
            else:
                steps.append(f"Az egyenletnek nincs megoldása (ellentmondás).")
                solution = "Nincs megoldás"
        else:
            final_solution = new_rhs / x_coefficient
            steps.append(f"Mindkét oldalt osztjuk {x} együtthatójával ({x_coefficient}):")
            steps.append(f"{x} = {final_solution}")
            solution = final_solution
        
        # Verification step
        if solution not in ["Nincs megoldás", f"Bármely {x} érték"]:
            verification = lhs.subs(x, solution) == rhs.subs(x, solution)
            steps.append(f"Ellenőrzés: {x}={solution} behelyettesítve: {lhs.subs(x, solution)} = {rhs.subs(x, solution)}")
            steps.append(f"Az ellenőrzés eredménye: {'Helyes' if verification else 'Hibás'}")
        
        return steps, solution
        
    except (sympy.SympifyError, TypeError, SyntaxError) as e:
        steps.append(f"Hiba történt az egyenlet értelmezése során: {e}")
        steps.append("Próbáld átírni az egyenletet egyszerűbb formára.")
        print(f"SymPy Error: {e} for input '{equation_string}'")
        return steps, None
    except Exception as e:
        steps.append(f"Nem várt hiba történt: {e}")
        print(f"Solving Error: {e}")
        return steps, None

def solve_equation(equation_string):
    """Attempts to parse and solve the equation string using SymPy."""
    try:
        # Use our step-by-step solver for linear equations
        steps, solution = step_by_step_linear_solve(equation_string)
        
        # Format the steps as HTML with line breaks
        formatted_steps = "<br>".join([f"<strong>Lépés {i+1}:</strong> {step}" for i, step in enumerate(steps)])
        
        # If we have a solution, add it to the formatted output
        if solution is not None:
            solution_str = f"x = {solution}"
        else:
            solution_str = "Nem sikerült megoldást találni."
            
        return formatted_steps, solution_str
        
    except Exception as e:
        # Log the error
        print(f"Solving Error: {e}")
        raise ValueError(f"Általános hiba az egyenlet megoldása közben: {e}")


def index(request):
    """Renders the main page and handles image upload, OCR, and solving."""
    context = {}
    if request.method == 'POST':
        uploaded_file = None
        filename = None
        
        # Check if we have a standard file upload
        if request.FILES.get('equation_image'):
            uploaded_file = request.FILES['equation_image']
        # Check if we have a base64 data upload from mobile camera
        elif request.POST.get('captured_image_data'):
            try:
                image_data = request.POST.get('captured_image_data')
                # Extract the base64 encoded image data
                if ',' in image_data:
                    format, imgstr = image_data.split(';base64,')
                else:
                    imgstr = image_data
                    
                # Convert base64 to file
                ext = 'jpg'  # Default extension
                data = base64.b64decode(imgstr)
                uploaded_file = ContentFile(data, name=f'captured_image.{ext}')
            except Exception as e:
                context['error'] = f"Nem sikerült feldolgozni a kamera képet: {e}"
                return render(request, 'mathsolver/index.html', context)
        else:
            context['error'] = "Nincs feldolgozható kép."
            return render(request, 'mathsolver/index.html', context)
        
        # Use a temporary directory within MEDIA_ROOT for uploads
        fs = FileSystemStorage(location=settings.MEDIA_ROOT)
        
        try:
            # Basic validation
            if not uploaded_file.content_type.startswith('image'):
                 raise ValueError("Csak képfájlok tölthetők fel.")

            # Save the file
            filename = fs.save(uploaded_file.name, uploaded_file)
            uploaded_file_url = fs.url(filename) # Get URL relative to MEDIA_URL
            file_path = os.path.join(settings.MEDIA_ROOT, filename) # Get absolute file path

            context['uploaded_file_name'] = filename
            context['uploaded_file_url'] = uploaded_file_url
            context['message'] = f"'{filename}' sikeresen feltöltve. Feldolgozás..."

            # --- Perform OCR ---
            try:
                equation_text = perform_ocr(file_path)
                context['equation'] = equation_text
                if not equation_text:
                     raise ValueError("Nem sikerült szöveget kiolvasni a képből.")
            except Exception as ocr_error:
                context['error'] = f"OCR Hiba: {ocr_error}"
                # Stop processing if OCR fails critically
                if filename and fs.exists(filename):
                    fs.delete(filename) # Clean up uploaded file
                return render(request, 'mathsolver/index.html', context)

            # --- Solve Equation ---
            try:
                solution_steps, solution_result = solve_equation(equation_text)
                context['solution_steps'] = solution_steps
                context['solution'] = solution_result
            except Exception as solve_error:
                context['error'] = f"Megoldási Hiba: {solve_error}"
                # Continue to render even if solving fails, but show the error

            # --- Cleanup ---
            # Consider deleting the file after processing, or implementing a cleanup task
            # For now, we leave it for display purposes. If you want to delete:
            # if filename and fs.exists(filename):
            #     fs.delete(filename)

        except Exception as e:
            context['error'] = f"Hiba a fájl feldolgozása közben: {e}"
            # Clean up if file was saved before the error occurred
            if filename and fs.exists(filename):
                 fs.delete(filename)

    return render(request, 'mathsolver/index.html', context)
