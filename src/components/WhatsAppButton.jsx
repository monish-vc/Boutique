import React from 'react';
import { FaWhatsapp } from 'react-icons/fa';
import { getWhatsAppLink } from '../lib/constants';

export default function WhatsAppButton() {
  return (
    <a
      href={getWhatsAppLink()}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-green-500 rounded-full flex items-center justify-center shadow-lg hover:bg-green-600 hover:scale-110 transition-all duration-300 group"
      aria-label="Chat on WhatsApp"
    >
      <FaWhatsapp className="text-white text-2xl" />
      <span className="absolute right-full mr-3 bg-white text-gray-800 text-xs font-sans px-3 py-1.5 rounded-lg shadow-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        Chat with us!
      </span>
    </a>
  );
}
