import React, { useState } from 'react';
import { Menu, Search, ShoppingBag, User, ChevronDown, ChevronRight, ChevronLeft, X } from 'lucide-react';

// Menu Data
const menuItems = {
  'FESTIVALS': [
    { title: 'New Arrivals', items: ['Latest Shoes', 'Latest Clothing', 'New in Running', 'New in Basketball'] },
    { title: 'Featured', items: ['SNKRS Launch Calendar', 'Best Sellers', 'Member Access', 'Gift Cards'] },
  ],
  'Men': [
    { title: 'Shoes', items: ['Running', 'Basketball', 'Jordan', 'Football', 'Gym and Training'] },
    { title: 'Clothing', items: ['T-Shirts & Tops', 'Hoodies & Sweatshirts', 'Shorts', 'Pants & Tights'] },
  ],
 
};

const Navbar = () => {
  const [activeMenu, setActiveMenu] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const [isSubMenuVisible, setIsSubMenuVisible] = useState(false);

  const handleCategoryClick = (category) => {
    setActiveCategory(category);
    setTimeout(() => setIsSubMenuVisible(true), 50);
  };

  const handleBack = () => {
    setIsSubMenuVisible(false);
    setTimeout(() => setActiveCategory(null), 300);
  };

  return (
    <nav className="fixed w-full top-0 z-50 bg-white">
     
     

      {/* Main Navbar */}
      <div className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 hover:bg-gray-100 rounded-full"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>

         

            {/* Desktop Menu */}
            <div className="hidden md:flex flex-1 justify-center">
              {Object.keys(menuItems).map((item) => (
                <div
                  key={item}
                  className="relative"
                  onMouseEnter={() => setActiveMenu(item)}
                  onMouseLeave={() => setActiveMenu(null)}
                >
                  <button className="px-3 py-6 text-base font-medium text-gray-700 hover:text-black flex items-center">
                    {item}
                    <ChevronDown className="ml-1 h-4 w-4 transition-transform duration-200 group-hover:rotate-180" />
                  </button>

                  {activeMenu === item && (
                    <div className="absolute left-0 w-screen bg-white shadow-lg py-8 border-t border-gray-200 animate-fadeIn"
                         style={{ marginLeft: '-50vw', left: '50%', right: '50%' }}>
                      <div className="max-w-7xl mx-auto px-8 grid grid-cols-4 gap-8">
                        {menuItems[item].map((section, idx) => (
                          <div key={idx}>
                            <h3 className="text-base font-bold mb-4 text-gray-900">{section.title}</h3>
                            <ul className="space-y-3">
                              {section.items.map((subItem, subIdx) => (
                                <li key={subIdx}>
                                  <a href="#" className="text-base text-gray-500 hover:text-black transition-colors duration-200">
                                    {subItem}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

           
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`fixed inset-0 bg-white z-50 transition-transform duration-300 ease-in-out ${
        isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        {/* Mobile Menu Header */}
        <div className="sticky top-0 bg-white z-10">
          <div className="flex justify-between items-center p-4 border-b">
            {activeCategory ? (
              <>
                <button 
                  onClick={handleBack}
                  className="flex items-center text-lg font-medium text-gray-900"
                >
                  <ChevronLeft className="h-5 w-5 mr-1" />
                  Back
                </button>
                <h2 className="text-lg font-bold">{activeCategory}</h2>
                <div className="w-8" />
              </>
            ) : (
              <>
                <h2 className="text-xl font-bold">Menu</h2>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Mobile Menu Content */}
        <div className="relative h-[calc(100vh-64px)] overflow-hidden">
          {/* Main Categories */}
          <div className={`absolute inset-0 transition-transform duration-300 ease-in-out ${
            isSubMenuVisible ? '-translate-x-full' : 'translate-x-0'
          }`}>
            <div className="h-full overflow-y-auto py-2">
              {Object.entries(menuItems).map(([category]) => (
                <button
                  key={category}
                  className="w-full p-4 text-left text-lg font-medium flex justify-between items-center hover:bg-gray-50 transition-colors"
                  onClick={() => handleCategoryClick(category)}
                >
                  <span>{category}</span>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </button>
              ))}
            </div>
          </div>

          {/* Subcategories */}
          <div className={`absolute inset-0 transition-transform duration-300 ease-in-out ${
            isSubMenuVisible ? 'translate-x-0' : 'translate-x-full'
          }`}>
            {activeCategory && (
              <div className="h-full overflow-y-auto">
                {menuItems[activeCategory]?.map((section, idx) => (
                  <div key={idx} className="py-4">
                    <h3 className="px-4 py-2 text-xs font-bold text-gray-900 uppercase tracking-wider">
                      {section.title}
                    </h3>
                    <ul className="border-b border-gray-100">
                      {section.items.map((item, itemIdx) => (
                        <li key={itemIdx}>
                          <a
                            href="#"
                            className="block px-4 py-3 text-base text-gray-900 hover:bg-gray-50 transition-colors"
                          >
                            {item}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;