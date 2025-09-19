// components/Loader.jsx
import { Skeleton } from 'antd';
// import 'antd/dist/reset.css'; // Ensure AntD styles are included
import PropTypes from 'prop-types';

const Loader = ({ active = true, rows = 3, width = '100%', className = '' }) => {
    return (
        <div className={`loader-container ${className}`}>
            <Skeleton
                active={active}
                paragraph={{ rows }}
                title={{ width }}
                className="p-4"
            />
        </div>
    );
};

Loader.propTypes = {
    active: PropTypes.bool,
    rows: PropTypes.number,
    width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    className: PropTypes.string,
};

export default Loader;