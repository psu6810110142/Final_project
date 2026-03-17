import { useTheme } from '../contexts/ThemeContext';

const OceanAnimations: React.FC = () => {
const { theme } = useTheme();

if (theme !== 'ocean') return null;
return (
    <>
        <div className="ocean-bubbles">
        {[...Array(10)].map((_, i) => <div key={i} className="bubble" />)}
        </div>
        <span className="fish fish-1">🐠</span>
        <span className="fish fish-2">🐟</span>
        <span className="fish fish-3">🦑</span>
        <span className="seagull seagull-1">🕊️</span>
        <span className="seagull seagull-2">🦅</span>
        <div className="wave-layer-1" />
        <div className="wave-layer-2" />
        <div className="wave-layer-3" />
        <div className="wave-layer-sand" />
        <span className="palm-left">🌴</span>
        <span className="palm-right">🌴</span>
    </>
    );
};

export default OceanAnimations;
