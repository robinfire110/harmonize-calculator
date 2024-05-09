import React, { useEffect } from 'react'

function Title({title}) {
    useEffect(() => {
        document.title = `Harmonize - ${title}`;
    }, []);
    return (
        <>
        </>
    )
}

export default Title