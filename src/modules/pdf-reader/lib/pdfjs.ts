import * as pdfjs from 'pdfjs-dist'
// Vite emits this worker bundle as its own hashed asset; pointing workerSrc at
// it lets pdf.js parse and render documents off the main thread.
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

pdfjs.GlobalWorkerOptions.workerSrc = workerUrl

export type { PDFDocumentProxy, RenderTask } from 'pdfjs-dist'
export default pdfjs
