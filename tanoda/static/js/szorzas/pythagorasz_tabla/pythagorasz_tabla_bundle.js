// Ez a bundle a PythagoraszTabla.jsx React komponenst mountolja a react-pythagorasz-root divbe
import React from 'react';
import { createRoot } from 'react-dom/client';
import PythagoraszTabla from './PythagoraszTabla';

const rootElement = document.getElementById('react-pythagorasz-root');
if (rootElement) {
    const root = createRoot(rootElement);
    root.render(<PythagoraszTabla />);
}
