import React from 'react';
import PropTypes from 'prop-types';
// import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
// import { Document, Page } from 'react-pdf';
// import { DownloadLink, BlobViewer, BlobProvider } from "@react-pdf/renderer"
// import { BlobProvider, Document, Page } from '@react-pdf/renderer';
import { Document, Page, pdfjs } from 'react-pdf';
import { applyDocTemplate, pdfDocTemplate } from 'services/docTemplateService';
import { Spin, Typography } from 'antd';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;
const { Paragraph } = Typography;

// Create Document Component
const PdfViewer = props => {
  const { file, loading, width } = props;

  if (loading) {
    return <Spin />
  }

  const onLoadError = (err) => {
    console.log('onLoadError', err);
  }

  const onSourceError = (err) => {
    console.log('onSourceError', err);
  }

  return <div style={{ width, backgroundColor: 'yellow' }}>
    <Document
      file={file}
      loading="PDF is loading. Please wait..."
      // onLoadError={onLoadError}
      // onSourceError={onSourceError}
    // onLoadSuccess={onDocumentLoadSuccess}
    >
      <Page 
      pageNumber={1}
      renderInteractiveForms={true}
       width={width} />
    </Document>
  </div>
};

PdfViewer.propTypes = {
  file: PropTypes.any.isRequired,
};

PdfViewer.defaultProps = {
};


export default PdfViewer