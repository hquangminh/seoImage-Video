import { useState } from 'react'
import './GlobalAttributesModal.css'

const GlobalAttributesModal = ({ type, isOpen, onClose, onApply }) => {
  const [globalTitle, setGlobalTitle] = useState('')
  const [globalAlt, setGlobalAlt] = useState('')
  const [globalDescription, setGlobalDescription] = useState('')

  if (!isOpen) return null

  const placeholders = {
    video: { title: 'Video Title', alt: 'Video Alt Text', description: 'Video Description' },
    image: { title: 'Image Title', alt: 'Image Alt Text', description: 'Image Description' },
  }

  const currentPlaceholders = placeholders[type] || placeholders.image

  return (
    <div className='modal-backdrop'>
      <div className='modal'>
        <input type='text' placeholder={currentPlaceholders.title} value={globalTitle} onChange={(e) => setGlobalTitle(e.target.value)} />
        <input type='text' placeholder={currentPlaceholders.alt} value={globalAlt} onChange={(e) => setGlobalAlt(e.target.value)} />
        <textarea placeholder={currentPlaceholders.description} value={globalDescription} onChange={(e) => setGlobalDescription(e.target.value)} />
        <button onClick={() => onApply(globalTitle, globalAlt, globalDescription)}>Apply to All</button>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  )
}

export default GlobalAttributesModal
