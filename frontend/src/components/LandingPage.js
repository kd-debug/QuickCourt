import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
    Calendar,
    MapPin,
    Users,
    Star,
    ArrowRight,
    Play,
    Shield,
    Zap,
    Globe
} from 'lucide-react';

const LandingPage = () => {
    const { isAuthenticated } = useAuth();

    const features = [
        {
            icon: <Calendar className="w-8 h-8 text-primary-600" />,
            title: "Easy Booking",
            description: "Book your favorite sports courts in just a few clicks with our intuitive interface."
        },
        {
            icon: <MapPin className="w-8 h-8 text-primary-600" />,
            title: "Local Venues",
            description: "Discover and book sports facilities near you with detailed location information."
        },
        {
            icon: <Users className="w-8 h-8 text-primary-600" />,
            title: "Community",
            description: "Join matches, meet new players, and build your local sports community."
        },
        {
            icon: <Star className="w-8 h-8 text-primary-600" />,
            title: "Verified Venues",
            description: "All venues are verified and reviewed by our community for quality assurance."
        }
    ];

    const stats = [
        { number: "500+", label: "Active Venues" },
        { number: "10K+", label: "Happy Users" },
        { number: "50K+", label: "Bookings Made" },
        { number: "4.8", label: "User Rating" }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
            {/* Navigation */}
            <nav className="bg-white/80 backdrop-blur-md border-b border-secondary-100 sticky top-0 z-50">
                <div className="container-custom">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center space-x-2">
                            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-xl">Q</span>
                            </div>
                            <span className="text-2xl font-bold text-gradient">QuickCourt</span>
                        </div>



                        <div className="flex items-center space-x-4">
                            {!isAuthenticated ? (
                                <>
                                    <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium transition-colors">
                                        Login
                                    </Link>
                                    <Link to="/signup" className="btn-primary">
                                        Get Started
                                    </Link>
                                </>
                            ) : (
                                <Link to="/dashboard" className="btn-primary">
                                    Go to Dashboard
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="section-padding">
                <div className="container-custom">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div className="space-y-8">
                            <div className="space-y-4">
                                <h1 className="text-5xl lg:text-6xl font-bold text-secondary-900 leading-tight">
                                    Book Your
                                    <span className="text-gradient block">Sports Court</span>
                                    <span className="text-secondary-600 text-2xl lg:text-3xl font-normal">
                                        Anytime, Anywhere
                                    </span>
                                </h1>
                                <p className="text-lg text-secondary-600 leading-relaxed">
                                    Discover and book local sports facilities instantly. From badminton courts to football turfs,
                                    find your perfect venue and join the local sports community.
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4">
                                {!isAuthenticated ? (
                                    <>
                                        <Link to="/signup" className="btn-primary text-center">
                                            Start Booking Now
                                            <ArrowRight className="w-5 h-5 ml-2 inline" />
                                        </Link>

                                    </>
                                ) : (
                                    <Link to="/dashboard" className="btn-primary text-center">
                                        Go to Dashboard
                                        <ArrowRight className="w-5 h-5 ml-2 inline" />
                                    </Link>
                                )}
                            </div>

                            <div className="flex items-center space-x-8 pt-4">
                                <div className="flex items-center space-x-2">
                                    <Shield className="w-5 h-5 text-success-500" />
                                    <span className="text-sm text-secondary-600">Secure Booking</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Zap className="w-5 h-5 text-accent-500" />
                                    <span className="text-sm text-secondary-600">Instant Confirmation</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Globe className="w-5 h-5 text-primary-500" />
                                    <span className="text-sm text-secondary-600">24/7 Support</span>
                                </div>
                            </div>
                        </div>

                        <div className="relative">
                            <div className="bg-gradient-to-br from-primary-500 to-accent-500 rounded-3xl p-8 text-white text-center shadow-large">
                                <div className="space-y-6">
                                    <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto">
                                        <Calendar className="w-10 h-10" />
                                    </div>
                                    <h3 className="text-2xl font-bold">Quick & Easy</h3>
                                    <p className="text-primary-100">
                                        Book your favorite sports court in under 2 minutes
                                    </p>
                                    <div className="bg-white/20 rounded-lg p-4">
                                        <div className="text-3xl font-bold">2 min</div>
                                        <div className="text-sm text-primary-100">Average booking time</div>
                                    </div>
                                </div>
                            </div>

                            {/* Floating elements */}
                            <div className="absolute -top-4 -right-4 bg-white rounded-2xl p-4 shadow-medium">
                                <div className="flex items-center space-x-3">
                                    <div className="w-12 h-12 bg-success-100 rounded-full flex items-center justify-center">
                                        <Star className="w-6 h-6 text-success-600" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-secondary-900">4.8</div>
                                        <div className="text-sm text-secondary-600">Rating</div>
                                    </div>
                                </div>
                            </div>

                            <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl p-4 shadow-medium">
                                <div className="flex items-center space-x-3">
                                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                                        <Users className="w-6 h-6 text-primary-600" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-secondary-900">10K+</div>
                                        <div className="text-sm text-secondary-600">Users</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-16 bg-white">
                <div className="container-custom">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {stats.map((stat, index) => (
                            <div key={index} className="text-center">
                                <div className="text-4xl font-bold text-primary-600 mb-2">{stat.number}</div>
                                <div className="text-secondary-600">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="section-padding bg-gradient-to-br from-secondary-50 to-primary-50">
                <div className="container-custom">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-secondary-900 mb-4">
                            Why Choose QuickCourt?
                        </h2>
                        <p className="text-lg text-secondary-600 max-w-2xl mx-auto">
                            We've built the most comprehensive sports booking platform to make your experience seamless and enjoyable.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((feature, index) => (
                            <div key={index} className="card text-center group hover:shadow-large transition-all duration-300 transform hover:-translate-y-2">
                                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary-200 transition-colors">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-semibold text-secondary-900 mb-3">{feature.title}</h3>
                                <p className="text-secondary-600 leading-relaxed">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="section-padding bg-gradient-primary">
                <div className="container-custom text-center">
                    <h2 className="text-4xl font-bold text-white mb-6">
                        Ready to Start Your Sports Journey?
                    </h2>
                    <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
                        Join thousands of sports enthusiasts who are already booking courts and building communities.
                    </p>
                    {!isAuthenticated ? (
                        <Link to="/signup" className="bg-white text-primary-600 hover:bg-primary-50 font-semibold py-4 px-8 rounded-lg text-lg transition-all duration-200 transform hover:scale-105 inline-flex items-center">
                            Get Started Free
                            <ArrowRight className="w-6 h-6 ml-2" />
                        </Link>
                    ) : (
                        <Link to="/dashboard" className="bg-white text-primary-600 hover:bg-primary-50 font-semibold py-4 px-8 rounded-lg text-lg transition-all duration-200 transform hover:scale-105 inline-flex items-center">
                            Go to Dashboard
                            <ArrowRight className="w-6 h-6 ml-2" />
                        </Link>
                    )}
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-secondary-900 text-white py-12">
                <div className="container-custom">
                    <div className="grid md:grid-cols-4 gap-8">
                        <div className="space-y-4">
                            <div className="flex items-center space-x-2">
                                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
                                    <span className="text-white font-bold">Q</span>
                                </div>
                                <span className="text-xl font-bold">QuickCourt</span>
                            </div>
                            <p className="text-secondary-300">
                                Your local sports booking platform. Connect, play, and grow your sports community.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold mb-4">Platform</h4>
                            <ul className="space-y-2 text-secondary-300">
                                <li><a href="#" className="hover:text-white transition-colors">How it Works</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Venues</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Sports</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-semibold mb-4">Support</h4>
                            <ul className="space-y-2 text-secondary-300">
                                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-semibold mb-4">Connect</h4>
                            <ul className="space-y-2 text-secondary-300">
                                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Community</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Partners</a></li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-secondary-700 mt-8 pt-8 text-center text-secondary-400">
                        <p>&copy; 2024 QuickCourt. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
