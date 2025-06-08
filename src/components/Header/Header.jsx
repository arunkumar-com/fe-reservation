import React from 'react'
import './Header.css'

const Header = () => {


    const handleScroll = () => {
      window.scrollBy({
        top: 600, // Scroll down by 1000 pixels
        behavior: 'smooth', // Smooth scrolling effect
      });
    };
  


  return (
    <div className='header'>
      <div className="header-contents">
        <h2>Order your favorite food here</h2>
        <p>Order your favorite delicious dishes and enjoy a flavorful experience right at your doorstep. Fresh, tasty meals delivered straight to you, whenever you’re hungry. Satisfy your cravings with just a few clicks and taste the difference!</p>
        <button onClick={handleScroll}>View Menu</button>
      </div>
    </div>
  )
}

export default Header
