"use client";

import { motion } from "framer-motion";
import { UserButton, useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles, Shield, Zap, Users, Brain, Heart, CheckCircle, Star } from "lucide-react";

// Simple fade animation component
const FadeIn = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay, ease: "easeOut" }}
  >
    {children}
  </motion.div>
);

const Navbar = () => {
  const { user } = useUser();
  return (
    <motion.nav 
      className="fixed top-0 w-full z-50 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-gray-200/20 dark:border-gray-800/20"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">D</span>
            </div>
            <span className="text-xl font-semibold text-gray-900 dark:text-white">DOQ</span>
          </Link>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link href="#features" className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors">
              Features
            </Link>
            <Link href="#pricing" className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors">
              Pricing
            </Link>
            <Link href="#about" className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors">
              About
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {!user ? (
              <>
                <Link href="/sign-in">
                  <Button variant="ghost" size="sm" className="text-sm font-medium">
                    Sign In
                  </Button>
                </Link>
                <Link href="/sign-up">
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                    Get Started
                  </Button>
                </Link>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link href="/dashboard">
                  <Button variant="outline" size="sm">
                    Dashboard
                  </Button>
                </Link>
                <UserButton />
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default function Home() {
  const { user } = useUser();
  
  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <FadeIn>
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 mb-8">
                <Sparkles className="w-4 h-4 text-blue-600 mr-2" />
                <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                  Powered by Qenz Intelligence
                </span>
              </div>
            </FadeIn>
            
            <FadeIn delay={0.1}>
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-gray-900 dark:text-white mb-6">
                The Future of
                <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
                  AI Healthcare
                </span>
              </h1>
            </FadeIn>
            
            <FadeIn delay={0.2}>
              <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
                Transform patient care with intelligent voice conversations. 
                Our AI specialists provide instant, accurate medical guidance 
                through natural voice interactions.
              </p>
            </FadeIn>
            
            <FadeIn delay={0.3}>
              <div className="flex justify-center items-center mb-16">
                {!user ? (
                  <Link href="/sign-up">
                    <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200">
                      Start Free Trial
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </Link>
                ) : (
                  <Link href="/dashboard">
                    <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200">
                      Go to Dashboard
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </Link>
                )}
              </div>
            </FadeIn>
            
            {/* Hero Visual */}
            <FadeIn delay={0.4}>
              <div className="relative max-w-5xl mx-auto">
                <div className="relative bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-3xl p-8 border border-gray-200 dark:border-gray-800 shadow-2xl">
                  <div className="grid md:grid-cols-2 gap-8 items-center">
                    <div className="space-y-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Live AI Consultation</span>
                      </div>
                      <div className="space-y-4">
                        <div className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm">
                          <p className="text-sm text-gray-600 dark:text-gray-300">"I've been having chest pain..."</p>
                        </div>
                        <div className="bg-blue-50 dark:bg-blue-900/30 rounded-xl p-4 shadow-sm">
                          <p className="text-sm text-blue-800 dark:text-blue-200">"I understand your concern. Can you describe the pain? Is it sharp or dull?"</p>
                        </div>
                      </div>
                    </div>
                    <div className="relative">
                      <Image
                        src="/medical-assistance.png"
                        alt="AI Medical Assistant Interface"
                        width={400}
                        height={300}
                        className="w-full h-auto rounded-xl shadow-lg"
                        priority
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl"></div>
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>
      
      {/* Stats Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <FadeIn delay={0.5}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">10K+</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Consultations</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">98%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Accuracy</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">24/7</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Available</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">50+</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Specialists</div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <FadeIn delay={0.6}>
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                Why Choose DOQ?
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Experience the next generation of healthcare with our AI-powered platform
              </p>
            </div>
          </FadeIn>
          
          <div className="grid md:grid-cols-3 gap-8">
            <FadeIn delay={0.7}>
              <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-800 hover:shadow-xl transition-shadow">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mb-6">
                  <Brain className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">AI-Powered Diagnosis</h3>
                <p className="text-gray-600 dark:text-gray-300">Advanced AI algorithms provide accurate medical insights and recommendations based on symptoms and medical history.</p>
              </div>
            </FadeIn>
            
            <FadeIn delay={0.8}>
              <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-800 hover:shadow-xl transition-shadow">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center mb-6">
                  <Shield className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Secure & Private</h3>
                <p className="text-gray-600 dark:text-gray-300">Your health data is protected with enterprise-grade security and HIPAA compliance standards.</p>
              </div>
            </FadeIn>
            
            <FadeIn delay={0.9}>
              <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-800 hover:shadow-xl transition-shadow">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center mb-6">
                  <Zap className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Instant Response</h3>
                <p className="text-gray-600 dark:text-gray-300">Get immediate medical guidance 24/7 without waiting for appointments or long queues.</p>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-6 lg:px-8 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto">
          <FadeIn delay={1.0}>
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                Simple, Transparent Pricing
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Choose the plan that fits your healthcare needs
              </p>
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <FadeIn delay={1.1}>
              <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-800">
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Basic</h3>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-gray-900 dark:text-white">Free</span>
                  </div>
                  <ul className="space-y-3 mb-8">
                    <li className="flex items-center text-gray-600 dark:text-gray-300">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                      5 consultations/month
                    </li>
                    <li className="flex items-center text-gray-600 dark:text-gray-300">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                      Basic AI responses
                    </li>
                    <li className="flex items-center text-gray-600 dark:text-gray-300">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                      Email support
                    </li>
                  </ul>
                  {!user ? (
                    <Link href="/sign-up">
                      <Button className="w-full" variant="outline">Get Started</Button>
                    </Link>
                  ) : (
                    <Link href="/dashboard">
                      <Button className="w-full" variant="outline">Current Plan</Button>
                    </Link>
                  )}
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={1.2}>
              <div className="bg-blue-600 rounded-2xl p-8 shadow-lg border-2 border-blue-500 relative">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-yellow-400 text-black px-4 py-1 rounded-full text-sm font-medium">Most Popular</span>
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-white mb-4">Plus</h3>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-white">$5</span>
                    <span className="text-blue-200">/month</span>
                  </div>
                  <ul className="space-y-3 mb-8">
                    <li className="flex items-center text-blue-100">
                      <CheckCircle className="w-5 h-5 text-blue-200 mr-3" />
                      Unlimited consultations
                    </li>
                    <li className="flex items-center text-blue-100">
                      <CheckCircle className="w-5 h-5 text-blue-200 mr-3" />
                      All specialist doctors
                    </li>
                    <li className="flex items-center text-blue-100">
                      <CheckCircle className="w-5 h-5 text-blue-200 mr-3" />
                      Advanced AI insights
                    </li>
                    <li className="flex items-center text-blue-100">
                      <CheckCircle className="w-5 h-5 text-blue-200 mr-3" />
                      Priority support
                    </li>
                  </ul>
                  {!user ? (
                    <Link href="/sign-up">
                      <Button className="w-full bg-white text-blue-600 hover:bg-gray-100">Choose Plus</Button>
                    </Link>
                  ) : (
                    <Link href="/dashboard/billing">
                      <Button className="w-full bg-white text-blue-600 hover:bg-gray-100">Choose Plus</Button>
                    </Link>
                  )}
                </div>
              </div>
            </FadeIn>


          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 dark:bg-gray-900 py-12 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-600 dark:text-gray-400">
            &copy; {new Date().getFullYear()} DOQ - Qenz Intelligence. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
