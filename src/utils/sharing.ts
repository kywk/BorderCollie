import LZString from 'lz-string'

/**
 * Compress and encode string to URL-safe format using LZ-String
 * LZ-String produces shorter output than Gzip + Base64 for this use case
 */
export function encodeData(text: string): string {
    try {
        return LZString.compressToEncodedURIComponent(text)
    } catch (e) {
        console.error('Encoding failed:', e)
        return ''
    }
}

/**
 * Decode and decompress string from LZ-String URL-safe format
 */
export function decodeData(encoded: string): string {
    try {
        return LZString.decompressFromEncodedURIComponent(encoded) || ''
    } catch (e) {
        console.error('Decoding failed:', e)
        return ''
    }
}
