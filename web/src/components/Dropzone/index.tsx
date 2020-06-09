import React, {useCallback, useState} from 'react'
import {useDropzone} from 'react-dropzone'
import { FiUpload } from 'react-icons/fi'
import './styles.css';

const Dropzone = () => {

  const [selectedFileURL, setSelectedFileURL] = useState('');

  const onDrop = useCallback(acceptedFiles => {
     const file = acceptedFiles[0];
     const fileURL = URL.createObjectURL(file);
     setSelectedFileURL(fileURL)
  }, [])

  const {getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: 'image/*',
  })

  return (
    <div className="dropzone" {...getRootProps()}>
      <input {...getInputProps()} accept="image/*"/>
      
      {
        selectedFileURL ? <img src={selectedFileURL} alt="Point"/> : (
          <p>
            <FiUpload/>
            Imagem do estabelecimento
          </p>
        )
      }

      <p>
        <FiUpload/>
        Imagem do estabelecimento
      </p>
    </div>
  )
}

export default Dropzone;