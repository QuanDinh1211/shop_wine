"use client";
import { Wine, Users, Globe, Heart } from "lucide-react";

export default function About() {
  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-red-900 mb-6">
            About VinoCellar
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            For over three decades, VinoCellar has been Vietnam's premier
            destination for exceptional wines, bringing together wine lovers and
            the world's finest vineyards.
          </p>
        </div>

        {/* Story Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Our Story
              </h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  Founded in 1992 by wine enthusiast Nguyen Minh Duc, VinoCellar
                  began as a small family business with a simple dream: to share
                  the joy of exceptional wines with fellow Vietnamese wine
                  lovers.
                </p>
                <p>
                  What started in a modest storefront in Ho Chi Minh City has
                  grown into Vietnam's most trusted wine retailer, serving
                  thousands of customers across the country. Our passion for
                  wine and commitment to quality has never wavered.
                </p>
                <p>
                  Today, we continue to honor our founder's vision by carefully
                  curating each bottle in our collection, ensuring that every
                  wine tells a story worth sharing.
                </p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-red-100 to-red-200 rounded-xl p-8 text-center">
              <Wine className="h-24 w-24 text-red-900 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-red-900 mb-2">
                Since 1992
              </h3>
              <p className="text-red-800">Over 30 years of wine expertise</p>
            </div>
          </div>
        </div>

        {/* Mission & Values */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="bg-gradient-to-br from-red-900 to-red-800 rounded-2xl p-8 text-white">
            <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
            <p className="text-red-100 leading-relaxed text-lg">
              To democratize the world of fine wines by making exceptional
              bottles accessible to everyone, while educating and inspiring our
              community to discover new flavors, regions, and stories that each
              wine has to offer.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Our Vision
            </h2>
            <p className="text-gray-600 leading-relaxed text-lg">
              To be Southeast Asia's leading wine destination, recognized for
              our expertise, integrity, and unwavering commitment to bringing
              people together through the shared appreciation of exceptional
              wines.
            </p>
          </div>
        </div>

        {/* Core Values */}
        <div className="mb-16">
          <h2 className="text-4xl font-bold text-center text-red-900 mb-12">
            Our Core Values
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white rounded-xl shadow-lg p-6 text-center group hover:shadow-xl transition-shadow">
              <div className="bg-red-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 group-hover:bg-red-200 transition-colors">
                <Wine className="h-8 w-8 text-red-900 mx-auto" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Excellence
              </h3>
              <p className="text-gray-600 leading-relaxed">
                We never compromise on quality. Every bottle is carefully
                selected and properly stored.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 text-center group hover:shadow-xl transition-shadow">
              <div className="bg-red-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 group-hover:bg-red-200 transition-colors">
                <Users className="h-8 w-8 text-red-900 mx-auto" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Community
              </h3>
              <p className="text-gray-600 leading-relaxed">
                We build lasting relationships with our customers, suppliers,
                and wine community.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 text-center group hover:shadow-xl transition-shadow">
              <div className="bg-red-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 group-hover:bg-red-200 transition-colors">
                <Globe className="h-8 w-8 text-red-900 mx-auto" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Sustainability
              </h3>
              <p className="text-gray-600 leading-relaxed">
                We support environmentally conscious wineries and sustainable
                practices.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 text-center group hover:shadow-xl transition-shadow">
              <div className="bg-red-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 group-hover:bg-red-200 transition-colors">
                <Heart className="h-8 w-8 text-red-900 mx-auto" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Passion</h3>
              <p className="text-gray-600 leading-relaxed">
                Our love for wine drives everything we do, from curation to
                customer service.
              </p>
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <h2 className="text-4xl font-bold text-center text-red-900 mb-12">
            Meet Our Team
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-gradient-to-br from-red-100 to-red-200 rounded-full w-32 h-32 mx-auto mb-4 flex items-center justify-center">
                <Users className="h-16 w-16 text-red-900" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Nguyen Minh Duc
              </h3>
              <p className="text-red-800 font-semibold mb-2">
                Founder & Master Sommelier
              </p>
              <p className="text-gray-600 text-sm">
                With over 35 years of experience, Duc leads our wine selection
                and education programs.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-gradient-to-br from-red-100 to-red-200 rounded-full w-32 h-32 mx-auto mb-4 flex items-center justify-center">
                <Users className="h-16 w-16 text-red-900" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Tran Thu Ha
              </h3>
              <p className="text-red-800 font-semibold mb-2">
                Head of Operations
              </p>
              <p className="text-gray-600 text-sm">
                Ha ensures every bottle reaches our customers in perfect
                condition and on time.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-gradient-to-br from-red-100 to-red-200 rounded-full w-32 h-32 mx-auto mb-4 flex items-center justify-center">
                <Users className="h-16 w-16 text-red-900" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Le Minh Quan
              </h3>
              <p className="text-red-800 font-semibold mb-2">
                Wine Education Director
              </p>
              <p className="text-gray-600 text-sm">
                Quan conducts our tasting events and helps customers discover
                their perfect wines.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
