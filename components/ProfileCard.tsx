import React from 'react';
import { Github, Mail, FileText } from 'lucide-react';
import { UserProfile } from '@/types';

// Hardcoded for demo based on screenshot
const PROFILE_DATA: UserProfile = {
  name: "@taemni",
  description: "안녕하세요, 차근차근 성장 중인 조태민입니다.",
  avatarUrl: "/profileImage.png",
  socials: {
    github: "https://github.com/EH-min",
    instagram: "https://www.instagram.com/tm_01j",
    email: "mailto:taeeee159@gmail.com"
  }
};

export const ProfileCard: React.FC = () => {
  return (
    <div className="mb-12 flex flex-col md:flex-row items-center gap-6 p-6 md:p-0 animate-fade-in">
      <div className="relative">
        <div className="w-28 h-28 md:w-32 md:h-32 rounded-full overflow-hidden border border-gray-200 dark:border-gray-800 shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={PROFILE_DATA.avatarUrl} 
            alt={PROFILE_DATA.name} 
            className="w-full h-full object-cover"
          />
        </div>
      </div>
      
      <div className="text-center md:text-left space-y-3">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {PROFILE_DATA.name}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
          {PROFILE_DATA.description}
        </p>
        <div className="flex items-center justify-center md:justify-start gap-3 text-gray-500 dark:text-gray-400">
          <a href={PROFILE_DATA.socials.github} target="_blank" rel="noreferrer" className="hover:text-gray-900 dark:hover:text-white transition-colors"><Github size={20} /></a>
          <a href={PROFILE_DATA.socials.instagram} target="_blank" rel="noreferrer" className="hover:text-gray-900 dark:hover:text-white transition-colors">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="https://cdn-icons-png.flaticon.com/512/1409/1409946.png" alt="instagram" className="w-5 h-5 opacity-60 hover:opacity-100 grayscale hover:grayscale-0" />
          </a>
          <a href={PROFILE_DATA.socials.email} className="hover:text-gray-900 dark:hover:text-white transition-colors"><Mail size={20} /></a>
          <a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors"><FileText size={20} /></a>
        </div>
      </div>
    </div>
  );
};
