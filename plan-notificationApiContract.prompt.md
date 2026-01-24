Tanoda – Notifikációs backend–frontend API contract: végrehajtásra kész technikai jelentés

---

### 1️⃣ API contract összefoglaló

#### /api/parent/notifications/  
- **Request:**  
  - GET  
  - Query: `cursor` (opcionális, string)  
- **Response:**  
  {
    "notifications": [ /* Notification */ ],
    "approval_requests": [ /* ApprovalRequest */ ],
    "meta": {
      "has_next": true|false,
      "next_cursor": "string|null"
    }
  }
  - **notifications**: array of Notification (lásd 2️⃣)
  - **approval_requests**: array of ApprovalRequest (lásd 2️⃣)
  - **meta**:  
    - has_next: kötelező, bool  
    - next_cursor: opcionális, string/null

#### /api/parent/approval/<id>/approve  
#### /api/parent/approval/<id>/reject  
- **Request:**  
  - POST  
  - Body: üres JSON (`{}`)  
- **Response:**  
  {
    "id": "string",           // kötelező, approval_request id
    "status": "approved"|"rejected", // kötelező
    "updated_at": "ISO8601"  // kötelező
  }

---

### 2️⃣ Esemény payload minták

#### payment_link_created
{
  "id": "evt_001",
  "type": "payment_link_created",
  "message": "Új támogatási lehetőség",
  "timestamp": "2026-01-05T12:00:00Z",
  "status": "info",
  "approval_id": "apr_001"
}
- Kötelező mezők: id, type, message, timestamp, status
- Opcionális: approval_id
- Ordering: timestamp, id

#### payment_approved
{
  "id": "evt_002",
  "type": "payment_approved",
  "message": "A fizetés jóváhagyva.",
  "timestamp": "2026-01-05T12:05:00Z",
  "status": "success",
  "approval_id": "apr_001"
}
- Kötelező: id, type, message, timestamp, status, approval_id

#### payment_rejected
{
  "id": "evt_003",
  "type": "payment_rejected",
  "message": "A fizetés nem lett jóváhagyva.",
  "timestamp": "2026-01-05T12:06:00Z",
  "status": "error",
  "approval_id": "apr_001"
}
- Kötelező: id, type, message, timestamp, status, approval_id

#### payment_success
{
  "id": "evt_004",
  "type": "payment_success",
  "message": "A támogatás sikeresen teljesült.",
  "timestamp": "2026-01-05T12:10:00Z",
  "status": "success"
}
- Kötelező: id, type, message, timestamp, status

#### payment_failed
{
  "id": "evt_005",
  "type": "payment_failed",
  "message": "A fizetési kísérlet sikertelen volt.",
  "timestamp": "2026-01-05T12:11:00Z",
  "status": "error"
}
- Kötelező: id, type, message, timestamp, status

#### invitation_sent
{
  "id": "evt_006",
  "type": "invitation_sent",
  "message": "Meghívó elküldve.",
  "timestamp": "2026-01-05T12:12:00Z",
  "status": "info"
}
- Kötelező: id, type, message, timestamp, status

**ApprovalRequest példa:**
{
  "id": "apr_001",
  "message": "Szülői jóváhagyás szükséges a fizetéshez.",
  "status": "pending",
  "created_at": "2026-01-05T12:00:00Z",
  "event_id": "evt_001"
}
- Kötelező: id, message, status, created_at, event_id

---

### 3️⃣ Idempotencia és ordering szabályok

- Minden esemény és approval_request egyedi, stabil `id`-val rendelkezik (string).
- Duplikáció kizárt: frontend csak unique id alapján renderel.
- Listaépítés: ordering timestamp (desc), azonos timestamp esetén id (desc).
- Backend az igazság forrása, minden állapot backendből származik.

---

### 4️⃣ Pagination és frissítés

- Cursor-alapú lapozás: `cursor` query paraméter, `meta.next_cursor` response-ban.
- Alapértelmezett limit: 50 notification / kérés.
- approval_requests nem paginált.
- Polling támogatott, 10–20 mp intervallum, minden poll GET /api/parent/notifications/.

---

### 5️⃣ Integrációs döntési összefoglaló

- Polling elég: egyszerű, megbízható, minden frontend frissítés backend truth alapján.
- Push (SSE/WebSocket) csak későbbi bővítésnél indokolt.
- Most nincs push, nincs extra endpoint, nincs backend logika a push-hoz.

---

### 6️⃣ Implementációs readiness checklist

- [x] API contract végleges, minden mező, típus, ordering, idempotencia rögzítve
- [x] Minden domain-eseményhez payload minta és kötelező mezők listája adott
- [x] Pagination, polling, ordering szabályok egyértelműek
- [x] Approval endpoint request/response shape rögzítve
- [x] Frontend komponens API és state-flow végleges
- [ ] Backend implementáció még nincs kész (de minden specifikáció adott)
- [ ] Frontend polling logika implementációja szükséges (de mindenhez van contract)

---

A rendszer implementációs sprintre kész: IGEN – minden szerződés, payload és integrációs szabály végleges, minden szükséges információ rendelkezésre áll.
