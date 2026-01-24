import React from 'react'
import NavBar from './NavBar.jsx';
import { useMessageStore } from '../Store/UseMessageStore.js';

const HomePage = () => {
    const {selectedUser} = useMessageStore();
    
    return (
        <div>
            <NavBar />
            <div className="h-screen flex items-center justify-center pt-20">
                <h1 className="text-3xl font-bold">Welcome to the Home Page!</h1>
            </div>
        </div>
    )
}

export default HomePage
