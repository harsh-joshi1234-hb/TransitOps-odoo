import React from 'react';
import { Link } from 'react-router-dom';
export default function PageNotFound() { return <div className='text-center p-12'><h1 className='text-4xl font-bold mb-4'>404</h1><p className='mb-4'>Page Not Found</p><Link to='/' className='text-blue-500'>Go Home</Link></div>; }
