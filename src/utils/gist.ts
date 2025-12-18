/**
 * BorderCollie - Gist Utility
 * 讀取公開 GitHub Gist 內容
 */

const GITHUB_GIST_API = 'https://api.github.com/gists'

export interface GistFile {
    filename: string
    content: string
    language: string | null
    raw_url: string
    size: number
}

export interface GistResponse {
    id: string
    description: string
    files: Record<string, GistFile>
    created_at: string
    updated_at: string
    html_url: string
}

export interface GistResult {
    success: boolean
    content?: string
    filename?: string
    error?: string
    gistId?: string
}

/**
 * 從公開 Gist 載入內容
 * 預設讀取第一個檔案，或可指定檔名
 */
export async function fetchPublicGist(
    gistId: string,
    targetFilename?: string
): Promise<GistResult> {
    try {
        const response = await fetch(`${GITHUB_GIST_API}/${gistId}`, {
            headers: {
                'Accept': 'application/vnd.github.v3+json'
            }
        })

        if (!response.ok) {
            if (response.status === 404) {
                return { success: false, error: 'Gist 不存在或為私人 Gist' }
            }
            if (response.status === 403) {
                return { success: false, error: 'API 請求次數超過限制，請稍後再試' }
            }
            return { success: false, error: `載入失敗 (${response.status})` }
        }

        const data: GistResponse = await response.json()
        const files = Object.values(data.files)

        if (files.length === 0) {
            return { success: false, error: 'Gist 沒有任何檔案' }
        }

        // 找到目標檔案
        let targetFile: GistFile | undefined

        if (targetFilename) {
            targetFile = files.find(f => f.filename === targetFilename)
            if (!targetFile) {
                return {
                    success: false,
                    error: `找不到檔案: ${targetFilename}`
                }
            }
        } else {
            // 優先選擇 .md 或 .txt 檔案
            targetFile = files.find(f =>
                f.filename.endsWith('.md') || f.filename.endsWith('.txt')
            ) ?? files[0]
        }

        return {
            success: true,
            content: targetFile.content,
            filename: targetFile.filename,
            gistId: data.id
        }
    } catch (error) {
        console.error('Gist fetch error:', error)
        return {
            success: false,
            error: '網路錯誤，請檢查連線狀態'
        }
    }
}

/**
 * 驗證 Gist ID 格式
 * Gist ID 為 32 字元的 hex 字串
 */
export function isValidGistId(id: string): boolean {
    return /^[a-f0-9]{32}$/.test(id)
}

/**
 * 從 URL 中提取 Gist ID
 * 支援格式：
 * - gist.github.com/username/GIST_ID
 * - gist.github.com/GIST_ID
 * - 純 GIST_ID
 */
export function extractGistId(input: string): string | null {
    const trimmed = input.trim()

    // 純 Gist ID
    if (isValidGistId(trimmed)) {
        return trimmed
    }

    // URL 格式
    try {
        const url = new URL(trimmed)
        if (url.hostname === 'gist.github.com') {
            const pathParts = url.pathname.split('/').filter(Boolean)
            // 格式: /username/GIST_ID 或 /GIST_ID
            const lastPart = pathParts[pathParts.length - 1]
            if (lastPart && isValidGistId(lastPart)) {
                return lastPart
            }
        }
    } catch {
        // 不是有效 URL，忽略
    }

    return null
}
