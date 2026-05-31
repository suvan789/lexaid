import React, { useState, useEffect } from 'react';
import API from '../api/axios';

export default function LawyerCard({ lawyer, onSelect, isSaved, onToggleSave }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group animate-fade-in">
      <div className="p-5 flex flex-col h-full">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-start gap-4 flex-1">
            <div className="w-16 h-16 rounded-full bg-navy flex items-center justify-center text-xl text-white font-bold shrink-0 shadow-inner">
              {lawyer.name.replace('Adv. ', '').charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
            <h3 className="font-bold text-navy text-lg truncate flex items-center gap-1.5">
              {lawyer.name}
              {lawyer.verified && (
                <span className="text-blue-500" title="Verified Lawyer">
                  <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </span>
              )}
            </h3>
            <p className="text-sm text-gray-500 mb-1 flex items-center gap-1">
              📍 {lawyer.city}, {lawyer.state}
            </p>
            <div className="flex items-center gap-1">
              <span className="text-yellow-400">★</span>
              <span className="font-medium text-sm">{lawyer.rating.toFixed(1)}</span>
              <span className="text-gray-400 text-xs">({lawyer.reviews_count} reviews)</span>
            </div>
          </div>
          </div>
          {onToggleSave && (
            <button onClick={(e) => { e.stopPropagation(); onToggleSave(); }} className={`p-2 rounded-full transition-colors ${isSaved ? 'text-red-500 bg-red-50 hover:bg-red-100' : 'text-gray-400 bg-gray-50 hover:bg-gray-100 hover:text-red-400'}`}>
              <svg className="w-5 h-5" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
              </svg>
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {lawyer.specialization?.map((spec, i) => (
            <span key={i} className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium border border-blue-100">
              {spec}
            </span>
          ))}
        </div>

        <div className="mt-auto pt-4 border-t border-gray-50 grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Experience</p>
            <p className="text-sm font-semibold text-navy">{lawyer.experience_years} Years</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Consultation Fee</p>
            <p className="text-sm font-semibold text-green-600">
              ₹{lawyer.fee_min} - ₹{lawyer.fee_max}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onSelect(lawyer)}
            className="flex-1 py-2 bg-navy text-white rounded-xl text-sm font-medium hover:bg-navy-light transition-colors"
          >
            View Profile
          </button>
        </div>
      </div>
    </div>
  );
}
