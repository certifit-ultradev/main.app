import React from 'react';

function Spinner() {
    return (
        <div className="flex items-center justify-center">
            {/* El contenedor del spinner */}
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#0BBBE7]"></div>
        </div>
    );
}

export default Spinner;