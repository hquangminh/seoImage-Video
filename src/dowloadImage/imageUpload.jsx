import React, { useEffect, useState } from 'react'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import './imageUpload.css'
import GlobalAttributesModal from '../ModalForm/GlobalAttributesModal'
import VideoUploadTool from '../dowloadVideo/videoUpload'

const ImageUploadTool = () => {
  const [images, setImages] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {}, [images])

  const applyGlobalAttributes = (title, alt, description) => {
    setImages(
      images.map((image) => ({
        ...image,
        title: title || image.title,
        alt: alt || image.alt,
        description: description || image.description,
      }))
    )
    setIsModalOpen(false)
  }

  function getMetadataForFile(file) {
    const metadata = {
      alt: 'Example alt text',
      description: 'Example description',
    }

    return metadata
  }

  const handleImageChange = (event) => {
    const fileArray = Array.from(event.target.files).map((file, index) => {
      const metadata = getMetadataForFile(file)
      const id = Date.now() + index
      return {
        id,
        file,
        src: URL.createObjectURL(file),
        alt: metadata.alt || '',
        title: file.name || `image${index + 1}.jpg`,
        description: metadata.description || '',
      }
    })

    setImages((prevImages) => [...prevImages, ...fileArray])
  }

  const updateAttribute = (id, attr, value) => {
    setImages((images) => images.map((image) => (image.id === id ? { ...image, [attr]: value } : image)))
  }

  const downloadImagesAsZip = async () => {
    const zip = new JSZip()
    const titleCounts = {}
    const manifest = []

    images.forEach((image, index) => {
      // Check if the filename has an extension
      const hasExtension = image.title.includes('.')
      let filename = hasExtension ? image.title : `${image.title}.jpg`

      if (titleCounts[filename]) {
        titleCounts[filename] += 1
        let nameParts, extension
        if (hasExtension) {
          nameParts = filename.split('.')
          extension = nameParts.pop()
        } else {
          // If there's no extension initially, treat the entire filename as the name part
          nameParts = [filename]
          extension = 'jpg' // Default extension
        }
        nameParts[nameParts.length - 1] += `_${titleCounts[filename]}`
        filename = nameParts.join('.') + '.' + extension
      } else {
        titleCounts[filename] = 1
      }

      // Add image file to the zip
      zip.file(filename, image.file)

      // Add image details to manifest
      manifest.push({
        filename,
        alt: image.alt,
        description: image.description,
      })
    })

    // Add manifest to zip
    zip.file('manifest.json', JSON.stringify(manifest))

    // Generate zip file and trigger download
    const content = await zip.generateAsync({ type: 'blob' })
    saveAs(content, 'images.zip')
  }

  const removeImage = (id) => {
    setImages(images.filter((image) => image.id !== id))
    URL.revokeObjectURL(images.find((image) => image.id === id).src)
  }

  const handleReset = () => {
    setImages([])
  }

  return (
    <>
      <div className='image-upload-container'>
        <div>
          <input type='file' multiple onChange={handleImageChange} id='fileInput' className='input_file' accept='image/*' />
          <label htmlFor='fileInput' className='button_custom'>
            Chọn File Image
          </label>
          <button onClick={handleReset} className='button_reset'>
            Reset
          </button>
          <button onClick={() => setIsModalOpen(true)} className='apply-all-button'>
            Apply to All
          </button>

          <GlobalAttributesModal type={'image'} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onApply={applyGlobalAttributes} />
        </div>
        <h4>File: {images.length}</h4>
        <div className='image-preview-container'>
          {images.map((image) => (
            <div key={image.id} className='image-attributes'>
              <img src={image.src} alt={`Preview ${image.id}`} className='image-preview' />
              <input
                type='text'
                placeholder='Alt text'
                className='input-field'
                value={image.alt}
                onChange={(e) => updateAttribute(image.id, 'alt', e.target.value)}
              />
              <input
                type='text'
                placeholder='Title'
                className='input-field'
                value={image.title}
                onChange={(e) => updateAttribute(image.id, 'title', e.target.value)}
              />
              <textarea
                placeholder='Description'
                className='input-field'
                value={image.description}
                onChange={(e) => updateAttribute(image.id, 'description', e.target.value)}
              />
              <button onClick={() => removeImage(image.id)} className='delete-button'>
                Delete
              </button>
            </div>
          ))}
        </div>
        <button className='download-button' onClick={downloadImagesAsZip} disabled={images.length === 0}>
          Download Images
        </button>
      </div>
      <VideoUploadTool />
    </>
  )
}

export default ImageUploadTool
