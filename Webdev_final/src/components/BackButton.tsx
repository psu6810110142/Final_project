import { useNavigate } from 'react-router-dom';

interface BackButtonProps {
  label?: string;
}

const BackButton: React.FC<BackButtonProps> = ({ label = '← ย้อนกลับ' }) => {
    const navigate = useNavigate();
    return (
    <button className="btn-back" onClick={() => navigate(-1)}>
        {label}
    </button>
    );
};

export default BackButton;