import React, { useEffect, useState } from 'react'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'

import './videoUpload.css'
import GlobalAttributesModal from '../ModalForm/GlobalAttributesModal'

const VideoUploadTool = () => {
  const [videos, setVideos] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {}, [videos])

  function getMetadataForFile(file) {
    const metadata = {
      alt: 'Example alt text',
      description: 'Example description',
    }

    return metadata
  }

  const applyGlobalAttributes = (title, alt, description) => {
    setVideos(
      videos.map((video) => ({
        ...video,
        title: title || video.title,
        alt: alt || video.alt,
        description: description || video.description,
      }))
    )
    setIsModalOpen(false)
  }
  const handleVideoChange = (event) => {
    const fileArray = Array.from(event.target.files).map((file, index) => {
      const metadata = getMetadataForFile(file)
      const id = Date.now() + index

      return {
        id,
        file,
        src: URL.createObjectURL(file),
        alt: metadata.alt || '',
        title: file.name || `video${index + 1}`,
        description: metadata.description || '',
      }
    })

    setVideos((prevVideos) => [...prevVideos, ...fileArray])
  }

  const updateAttribute = (id, attr, value) => {
    console.log('id', id)
    setVideos((video) => video.map((video) => (video.id === id ? { ...video, [attr]: value } : video)))
  }

  const downloadVideosAsZip = async () => {
    const zip = new JSZip()
    const titleCounts = {}
    const manifest = []

    videos.forEach((video, index) => {
      let filename = video.title
      // Đảm bảo filename có đuôi là .mp4
      if (!filename.endsWith('.mp4')) {
        filename += '.mp4'
      }

      if (titleCounts[filename]) {
        titleCounts[filename] += 1
        const nameParts = filename.split('.')
        nameParts.pop()
        nameParts[nameParts.length - 1] += `_${titleCounts[filename]}`
        filename = nameParts.join('.') + '.mp4'
      } else {
        titleCounts[filename] = 1
      }

      // Add video file to the zip
      zip.file(filename, video.file)

      // Add video details to manifest
      manifest.push({
        filename,
        alt: video.alt,
        description: video.description,
      })
    })

    // Add manifest to zip
    zip.file('manifest.json', JSON.stringify(manifest))

    // Generate zip file and trigger download
    const content = await zip.generateAsync({ type: 'blob' })
    saveAs(content, 'videos.zip')
  }

  const removeVideo = (id) => {
    setVideos(videos.filter((video) => video.id !== id))
    URL.revokeObjectURL(videos.find((video) => video.id === id).src)
  }

  const handleReset = () => {
    setVideos([])
  }

  return (
    <div className='image-upload-container'>
      <div>
        <input type='file' id='fileInputVideo' multiple onChange={handleVideoChange} accept='video/*' className='input_file_video' />
        <label htmlFor='fileInputVideo' className='button_custom_video'>
          Chọn File Video
        </label>

        <button onClick={handleReset} className='button_reset'>
          Reset
        </button>
        <button onClick={() => setIsModalOpen(true)} className='apply-all-button'>
          Apply to All
        </button>
        <GlobalAttributesModal type={'video'} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onApply={applyGlobalAttributes} />
      </div>
      <h4>File: {videos.length}</h4>
      <div className='image-preview-container'>
        {videos.map((video) => (
          <div key={video.id} className='video-attributes'>
            <video src={video.src} className='video-preview' controls>
              Preview {video.id}
            </video>
            <input
              type='text'
              placeholder='Alt text'
              className='input-field'
              value={video.alt}
              onChange={(e) => updateAttribute(video.id, 'alt', e.target.value)}
            />
            <input
              type='text'
              placeholder='Title'
              className='input-field'
              value={video.title}
              onChange={(e) => updateAttribute(video.id, 'title', e.target.value)}
            />
            <textarea
              placeholder='Description'
              className='input-field'
              value={video.description}
              onChange={(e) => updateAttribute(video.id, 'description', e.target.value)}
            />
            <button onClick={() => removeVideo(video.id)} className='delete-button'>
              Delete
            </button>
          </div>
        ))}
      </div>
      <button className='download-button' onClick={downloadVideosAsZip} disabled={videos.length < 1}>
        Download Videos
      </button>
    </div>
  )
}

export default VideoUploadTool
