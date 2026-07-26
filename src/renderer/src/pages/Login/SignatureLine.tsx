import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

const PATH = 'M0,130 L40,130 C50,130 55,60 65,60 C75,60 80,200 90,200 C100,200 105,100 115,100 C125,100 130,130 140,130 L300,130'

export function SignatureLine(): React.JSX.Element {
    const [reduced, setReduced] = useState(false)

    useEffect(() => {
        setReduced(window.matchMedia('(prefers-reduced-motion: reduce)').matches)
    }, [])

    return (
        <svg viewBox="0 0 300 260" className="w-full h-auto" aria-hidden="true">
            <defs>
                <radialGradient id="glow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#A87F4F" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#A87F4F" stopOpacity="0" />
                </radialGradient>
            </defs>

            <path id="signature-path" d={PATH} fill="none" stroke="transparent" />

            {reduced ? (
                <path d={PATH} fill="none" stroke="#A87F4F" strokeWidth="1.5" strokeLinecap="round" />
            ) : (
                <>
                    <motion.path
                        d={PATH}
                        fill="none"
                        stroke="#A87F4F"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 1.4, ease: 'easeInOut' }}
                    />
                    <circle r="4" fill="url(#glow)">
                        <animateMotion dur="6.5s" repeatCount="indefinite" begin="1.4s">
                            <mpath href="#signature-path" />
                        </animateMotion>
                    </circle>
                </>
            )}
        </svg>
    )
}