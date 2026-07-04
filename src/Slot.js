// src/Slot.js
import React, { useState } from 'react';

const Slot = ({ day }) => {
  const [name, setName] = useState('');
  return (
    <div>
      <h3>Slot for {day}</h3>
      <input
        type='text'
        placeholder='Enter name'
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <p>Name: {name}</p>
    </div>
  );
};

export default Slot;
