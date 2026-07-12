import React from 'react';
import { Link } from 'react-router-dom';
export default function Sidebar() { return <aside className='w-64 bg-gray-800 text-white min-h-screen p-4'><nav className='space-y-2'><Link to='/dashboard' className='block py-2 px-4 hover:bg-gray-700 rounded'>Dashboard</Link></nav></aside>; }
