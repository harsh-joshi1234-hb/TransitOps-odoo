import React from 'react';
export default function Modal({isOpen, children}) { return isOpen ? <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center'><div className='bg-white p-6 rounded'>{children}</div></div> : null; }
