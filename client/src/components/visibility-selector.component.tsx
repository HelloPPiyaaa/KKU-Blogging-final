import React, { useState } from 'react';
import { FaEarthAmericas } from 'react-icons/fa6';
import { FaUserFriends } from 'react-icons/fa';

const VisibilitySelector = ({ 
  visibility, 
  onChange 
}: { 
  visibility: string;
  onChange: (value: 'public' | 'followers') => void;
}) => {
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <div className="position-relative mb-4">
      <p className="text-secondary mb-2">โพสต์นี้จะแสดงให้ใครเห็นบ้าง?</p>
      <div className="dropdown">
        <button 
          className="btn btn-light w-100 d-flex align-items-center justify-content-between"
          onClick={() => setShowDropdown(!showDropdown)}
          style={{ border: '1px solid #dee2e6' }}
        >
          <div className="d-flex align-items-center gap-2">
            {visibility === 'public' ? (
              <>
                <FaEarthAmericas className="text-secondary" /> 
                <span>สาธารณะ - ทุกคนสามารถเห็นโพสต์นี้</span>
              </>
            ) : (
              <>
                <FaUserFriends className="text-secondary" /> 
                <span>ผู้ติดตาม - เฉพาะผู้ติดตามเท่านั้นที่จะเห็นโพสต์นี้</span>
              </>
            )}
          </div>
          <i className={`bi bi-chevron-${showDropdown ? 'up' : 'down'}`}></i>
        </button>
        
        {showDropdown && (
          <div className="dropdown-menu show w-100 p-2">
            <button 
              className={`dropdown-item d-flex align-items-center gap-2 p-2 rounded ${visibility === 'public' ? 'active' : ''}`}
              onClick={() => {
                onChange('public');
                setShowDropdown(false);
              }}
            >
              <FaEarthAmericas className="text-secondary" />
              <div>
                <div>สาธารณะ</div>
                <small className="text-secondary">ทุกคนสามารถเห็นโพสต์นี้</small>
              </div>
            </button>
            <button 
              className={`dropdown-item d-flex align-items-center gap-2 p-2 rounded ${visibility === 'followers' ? 'active' : ''}`}
              onClick={() => {
                onChange('followers');
                setShowDropdown(false);
              }}
            >
              <FaUserFriends className="text-secondary" />
              <div>
                <div>ผู้ติดตาม</div>
                <small className="text-secondary">เฉพาะผู้ติดตามเท่านั้นที่จะเห็นโพสต์นี้</small>
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VisibilitySelector;