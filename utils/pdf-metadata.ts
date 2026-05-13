import {
  EncryptedPDFError,
  PDFDocument,
  PDFHexString,
  PDFName,
  PDFString,
} from 'pdf-lib';
import type { PDFDict } from 'pdf-lib';

/** Standard /Document Information dictionary fields plus catalog language and XMP presence. */
export type PdfStandardMetadata = {
  title?: string;
  author?: string;
  subject?: string;
  keywords?: string;
  creator?: string;
  producer?: string;
  creationDate?: string;
  modificationDate?: string;
  language?: string;
  encrypted: boolean;
  hasEmbeddedXmp: boolean;
};

export class PdfMetadataError extends Error {
  readonly code: 'ENCRYPTED' | 'LOAD_FAILED' | 'STRIP_FAILED';

  constructor(code: PdfMetadataError['code'], message: string) {
    super(message);
    this.name = 'PdfMetadataError';
    this.code = code;
  }
}

/** Avoid pdf-lib mutating producer/dates on load (default `updateMetadata` is true). */
const LOAD_NO_MUTATION = { updateMetadata: false } as const;

type DocWithInfo = { getInfoDict(): PDFDict };

function asDocWithInfo(doc: PDFDocument): DocWithInfo {
  return doc as unknown as DocWithInfo;
}

function formatDate(value: Date | undefined): string | undefined {
  if (!value) return undefined;
  try {
    return value.toISOString();
  } catch {
    return String(value);
  }
}

function readLanguage(doc: PDFDocument): string | undefined {
  const raw = doc.catalog.lookupMaybe(PDFName.of('Lang'), PDFString, PDFHexString);
  if (!raw) return undefined;
  return raw.decodeText();
}

function hasEmbeddedXmp(doc: PDFDocument): boolean {
  return doc.catalog.lookup(PDFName.of('Metadata')) !== undefined;
}

function describeLoadError(err: unknown): string {
  if (err instanceof EncryptedPDFError) {
    return 'This PDF is password-protected or encrypted. Decrypt it elsewhere, then try again.';
  }
  if (err instanceof Error) return err.message;
  return 'Could not parse this file as a PDF.';
}

export async function readPdfMetadata(source: Uint8Array | ArrayBuffer): Promise<PdfStandardMetadata> {
  const bytes = source instanceof Uint8Array ? source : new Uint8Array(source);
  let doc: PDFDocument;
  try {
    doc = await PDFDocument.load(bytes, LOAD_NO_MUTATION);
  } catch (err) {
    if (err instanceof EncryptedPDFError) {
      throw new PdfMetadataError('ENCRYPTED', describeLoadError(err));
    }
    throw new PdfMetadataError('LOAD_FAILED', describeLoadError(err));
  }

  return {
    title: doc.getTitle(),
    author: doc.getAuthor(),
    subject: doc.getSubject(),
    keywords: doc.getKeywords(),
    creator: doc.getCreator(),
    producer: doc.getProducer(),
    creationDate: formatDate(doc.getCreationDate()),
    modificationDate: formatDate(doc.getModificationDate()),
    language: readLanguage(doc),
    encrypted: doc.isEncrypted,
    hasEmbeddedXmp: hasEmbeddedXmp(doc),
  };
}

const INFO_KEYS_TO_STRIP = [
  'Title',
  'Author',
  'Subject',
  'Keywords',
  'Creator',
  'Producer',
  'CreationDate',
  'ModDate',
  'Trapped',
] as const;

/**
 * Clears the document Info dictionary entries, `/Lang` on the catalog, and the `/Metadata` (XMP) reference.
 * Does not remove other extensions (e.g. document-level JavaScript). Processing stays fully local in the extension.
 */
export async function stripPdfMetadata(source: Uint8Array | ArrayBuffer): Promise<Uint8Array> {
  const bytes = source instanceof Uint8Array ? source : new Uint8Array(source);
  let doc: PDFDocument;
  try {
    doc = await PDFDocument.load(bytes, LOAD_NO_MUTATION);
  } catch (err) {
    if (err instanceof EncryptedPDFError) {
      throw new PdfMetadataError('ENCRYPTED', describeLoadError(err));
    }
    throw new PdfMetadataError('LOAD_FAILED', describeLoadError(err));
  }

  if (doc.isEncrypted) {
    throw new PdfMetadataError(
      'ENCRYPTED',
      'This PDF is password-protected or encrypted. Decrypt it elsewhere, then try again.',
    );
  }

  try {
    const info = asDocWithInfo(doc).getInfoDict();
    for (const name of INFO_KEYS_TO_STRIP) {
      info.delete(PDFName.of(name));
    }
    doc.catalog.delete(PDFName.of('Metadata'));
    doc.catalog.delete(PDFName.of('Lang'));
  } catch (err) {
    throw new PdfMetadataError('STRIP_FAILED', describeLoadError(err));
  }

  const out = await doc.save({ addDefaultPage: false });
  return out instanceof Uint8Array ? out : new Uint8Array(out);
}

export function buildStrippedDownloadName(originalName: string): string {
  const trimmed = originalName.trim() || 'document.pdf';
  const lower = trimmed.toLowerCase();
  if (lower.endsWith('.pdf')) {
    return `${trimmed.slice(0, -4)}-metadata-stripped.pdf`;
  }
  return `${trimmed}-metadata-stripped.pdf`;
}

export function downloadPdfBytes(data: Uint8Array, filename: string): void {
  const blob = new Blob([Uint8Array.from(data)], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = 'noopener';
  anchor.click();
  URL.revokeObjectURL(url);
}
