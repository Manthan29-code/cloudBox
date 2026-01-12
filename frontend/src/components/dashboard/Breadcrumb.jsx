import React from 'react';
import { Link } from 'react-router-dom';
import { FaHome, FaChevronRight } from 'react-icons/fa';

const Breadcrumb = ({ breadcrumbs }) => {
    return (
        <div className="flex items-center flex-wrap gap-2 text-sm text-gray-600">
            <Link to="/dashboard" className="hover:text-black font-medium flex items-center gap-1">
                <FaHome /> Home
            </Link>
            {breadcrumbs.map((crumb, index) => (
                <React.Fragment key={crumb._id}>
                    <FaChevronRight className="text-gray-300 text-xs" />
                    <Link
                        to={`/dashboard/${crumb._id}`}
                        className={`font-medium max-w-[150px] truncate ${index === breadcrumbs.length - 1 ? 'text-black font-bold' : 'hover:text-black'}`}
                    >
                        {crumb.name}
                    </Link>
                </React.Fragment>
            ))}
        </div>
    );
};

export default Breadcrumb;
