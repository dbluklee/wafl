import React from 'react';
import Block from '../components/BlockComp';
import HighlightBlock from '../components/BlockHighlightComp';
import BlockSmall from '../components/BlockSmallComp';
import BlockPromotion from '../components/BlockPromoComp';

// Image assets
import promotionTopImage from '../assets/images/HomePage/promotion-top.jpg';
import promotionMid1Image from '../assets/images/HomePage/promotion-mid1.jpg';
import promotionMid2Image from '../assets/images/HomePage/promotion-mid2.jpg';
import promotionBottomImage from '../assets/images/HomePage/promotion-bottom.jpg';
import Log from '../components/LogComp';

// Icon assets for small blocks
import burnanaLogoImage from '../assets/Common/burnana-logo.svg';
import settingsIcon from '../assets/HomePage/settings.svg';
import helpIcon from '../assets/HomePage/help.svg';
import languagesIcon from '../assets/HomePage/languages.svg';
import mailIcon from '../assets/HomePage/mail.svg';

export default function ComponentShowcasePage() {
  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Title */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-2">Figma Component Showcase</h1>
          <p className="text-gray-400">Individual components extracted from Figma design</p>
        </div>

        {/* Block Component */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">1. Block Component</h2>
          <p className="text-gray-400">Main content blocks with title, intro, description and arrow button</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="w-[440px] h-[220px]">
              <BlockComp 
                intro="Let's begin sales!"
                title="Management"
                description="All the information about our store can be modified here!"
              />
            </div>
            <div className="w-[440px] h-[220px]">
              <BlockComp 
                intro=""
                title="Dashboard"
                description="A real-time control tower for our store, all at a glance."
              />
            </div>
            <div className="w-[440px] h-[220px]">
              <BlockComp 
                intro="If you want to do business better"
                title="Analytics"
                description="Check it every day to make better strategies!"
              />
            </div>
          </div>
        </div>

        {/* HighlightBlock Component */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">2. HighlightBlock Component</h2>
          <p className="text-gray-400">Special block with gradient text effect for highlighting important content</p>
          <div className="w-[440px] h-[220px]">
            <HighlightBlock 
              intro="Ask us anything, from data to operational tips."
              title="AI Agent"
            />
          </div>
        </div>

        {/* BlockSmall Components */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">3. BlockSmall Component</h2>
          <p className="text-gray-400">Small icon blocks for utility functions</p>
          <div className="flex gap-4 flex-wrap">
            <div className="w-[100px] h-[100px]">
              <BlockSmall icon="" alt="Empty" />
            </div>
            <div className="w-[100px] h-[100px]">
              <BlockSmall icon={burnanaLogoImage} alt="Burnana Logo" />
            </div>
            <div className="w-[100px] h-[100px]">
              <BlockSmall icon={settingsIcon} alt="Settings" />
            </div>
            <div className="w-[100px] h-[100px]">
              <BlockSmall icon={helpIcon} alt="Help" />
            </div>
            <div className="w-[100px] h-[100px]">
              <BlockSmall icon={languagesIcon} alt="Languages" />
            </div>
            <div className="w-[100px] h-[100px]">
              <BlockSmall icon={mailIcon} alt="Mail" />
            </div>
          </div>
        </div>

        {/* Image Components */}
        <div className="space-y-8">
          <h2 className="text-2xl font-semibold text-white">4. BlockPromotion Component</h2>
          <p className="text-gray-400">Unified component for all promotion images with consistent styling</p>
          
          {/* PromotionTop */}
          <div className="space-y-2">
            <h3 className="text-xl font-medium text-white">BlockPromotion - Top (QR Code)</h3>
            <p className="text-gray-400">QR code payment scanning image</p>
            <div className="w-[273px] h-[220px]">
              <BlockPromotion 
                imageUrl={promotionTopImage} 
                alt="QR Code Payment" 
                dataName="promotion-top"
              />
            </div>
          </div>

          {/* PromotionMid1 */}
          <div className="space-y-2">
            <h3 className="text-xl font-medium text-white">BlockPromotion - Mid1 (Chef)</h3>
            <p className="text-gray-400">Smiling chef holding tablet in modern cafe</p>
            <div className="w-[220px] h-[219px]">
              <BlockPromotion 
                imageUrl={promotionMid1Image} 
                alt="Smiling chef holding tablet" 
                dataName="promotion-mid1"
              />
            </div>
          </div>

          {/* PromotionMid2 */}
          <div className="space-y-2">
            <h3 className="text-xl font-medium text-white">BlockPromotion - Mid2 (Analytics)</h3>
            <p className="text-gray-400">Female analyst using computer dashboard for business data</p>
            <div className="w-[340px] h-[219px]">
              <BlockPromotion 
                imageUrl={promotionMid2Image} 
                alt="Female analyst using computer dashboard for business data analysis" 
                dataName="promotion-mid2"
              />
            </div>
          </div>

          {/* PromotionBottom */}
          <div className="space-y-2">
            <h3 className="text-xl font-medium text-white">BlockPromotion - Bottom (Robot)</h3>
            <p className="text-gray-400">AI robot assistant for customer service</p>
            <div className="w-[173px] h-[220px]">
              <BlockPromotion 
                imageUrl={promotionBottomImage} 
                alt="Anthropomorphic robot that performs regular human job" 
                dataName="promotion-bottom"
              />
            </div>
          </div>
        </div>

        {/* Log Component */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">5. Log Component</h2>
          <p className="text-gray-400">Log entry component with timestamp, text, and optional undo functionality</p>
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white">Default Log</h3>
            <div className="w-full max-w-2xl h-[64px]">
              <Log 
                time="12:34"
                text="User logged in successfully"
              />
            </div>
            
            <div className="w-full max-w-2xl h-[64px]">
              <Log 
                time="12:35"
                text="Database backup completed"
                itemLabel="System"
              />
            </div>
            
            <h3 className="text-lg font-medium text-white">Undo Log</h3>
            <div className="w-full max-w-2xl h-[64px]">
              <Log 
                time="12:36"
                text="Item deleted from inventory"
                itemLabel="Inventory"
                property1="Undo"
                onUndo={() => alert('Undo clicked!')}
              />
            </div>
            
            <div className="w-full max-w-2xl h-[64px]">
              <Log 
                time="12:37"
                text="Configuration changed: Theme switched to dark mode"
                property1="Undo"
                onUndo={() => alert('Undo theme change!')}
              />
            </div>
          </div>
        </div>

        {/* Navigation back to HomePage */}
        <div className="text-center pt-12 border-t border-gray-700">
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg"
          >
            Back to HomePage
          </button>
          <p className="text-gray-400 mt-2">Or modify the App.tsx to switch between components</p>
        </div>
      </div>
    </div>
  );
}