import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
    const { isAuthenticated, logout } = useContext(AuthContext);
    const location = useLocation();

    const isActive = (path) => {
        return location.pathname === path;
    };

    return (
        <nav className="bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-200/80 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <Link to="/" className="group">
                        <span className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent group-hover:from-orange-700 group-hover:to-red-700 transition-all duration-200">
                            🍴 Tri Thức Vị Giác
                        </span>
                    </Link>

                    <ul className="flex items-center space-x-1">
                        <li>
                            <Link
                                to="/reviews"
                                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${isActive('/reviews')
                                        ? 'text-orange-600 bg-orange-50 hover:bg-orange-100 hover:text-orange-700'
                                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                    }`}
                            >
                                <span>🔍</span>
                                Khám phá
                            </Link>
                        </li>

                        {isAuthenticated ? (
                            <>
                                <li>
                                    <Link
                                        to="/reviews/create"
                                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${isActive('/reviews/create')
                                                ? 'text-orange-600 bg-orange-50 hover:bg-orange-100 hover:text-orange-700'
                                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                            }`}
                                    >
                                        <span>✍️</span>
                                        Viết Review
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to="/profile"
                                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${isActive('/profile')
                                                ? 'text-orange-600 bg-orange-50 hover:bg-orange-100 hover:text-orange-700'
                                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                            }`}
                                    >
                                        <span>👤</span>
                                        Hồ sơ
                                    </Link>
                                </li>
                                <li>
                                    <button
                                        onClick={logout}
                                        className="ml-2 inline-flex items-center justify-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-lg shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed bg-gray-100 text-gray-800 hover:bg-gray-200 focus:ring-gray-500 border-gray-200"
                                    >
                                        <span className="mr-1">👋</span>
                                        Đăng xuất
                                    </button>
                                </li>
                            </>
                        ) : (
                            <>
                                <li>
                                    <Link to="/login" className="inline-flex items-center justify-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-lg shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed bg-gray-100 text-gray-800 hover:bg-gray-200 focus:ring-gray-500 border-gray-200">
                                        <span className="mr-1">🚪</span>
                                        Đăng nhập
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/register" className="ml-2 inline-flex items-center justify-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-lg shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed bg-orange-600 text-white hover:bg-orange-700 focus:ring-orange-500 active:bg-orange-800">
                                        <span className="mr-1">🌟</span>
                                        Đăng ký
                                    </Link>
                                </li>
                            </>
                        )}
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default Navbar; 