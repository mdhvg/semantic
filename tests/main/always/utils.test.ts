import { splitContent } from '../../../src/main/utils'
import { test, expect } from 'vitest'

test('Tests the chunk creation algorithm on HTML', () => {
	const mime = 'text/html'
	const content = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dummy Text</title>
</head>
<body>
    <h1>Welcome to My Dummy Page</h1>
    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
</body>
</html>
`
	const result = splitContent(content, 10, mime)
	expect(result).toEqual({
		plainTextChunks: [
			'Welcome Dummy Page Lorem ipsum dolor sit amet, consectetur adipiscing',
			'elit. Sed eiusmod tempor incididunt labore dolore magna aliqua. enim',
			'minim veniam, quis nostrud exercitation ullamco laboris nisi aliquip commodo',
			'consequat. Duis aute irure dolor reprehenderit voluptate velit esse cillum',
			'dolore fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident,',
			'sunt culpa qui officia deserunt mollit anim est laborum.'
		],
		mimeFormatChunks: [
			'\n' +
				'<!DOCTYPE html>\n' +
				'<html lang="en">\n' +
				'<head>\n' +
				'    <meta charset="UTF-8">\n' +
				'    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n' +
				'    <title>Dummy Text</title>\n' +
				'</head>\n' +
				'<body>\n' +
				'    <h1>Welcome to My Dummy Page</h1>\n' +
				'    <p>Lorem ipsum dolor sit amet, consectetur adipiscing',
			' elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim',
			' ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo',
			' consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum',
			' dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident,',
			' sunt in culpa qui officia deserunt mollit anim id est laborum.</p>\n' +
				'</body>\n' +
				'</html>\n'
		]
	})
	expect(result.plainTextChunks.length === result.mimeFormatChunks.length).toBeTruthy()
})

test('Tests the chunk creation algorithm on plain text', () => {
	const mime = 'text/markdown'
	const content = `
The algorithm reduces the number of colors by applying a threshold map M to the pixels displayed, causing some pixels to change color, depending on the distance of the original color from the available color entries in the reduced palette.
The first threshold maps were designed by hand to minimise the perceptual difference between a grayscale image and its two-bit quantisation for up to a 4x4 matrix. [1]
An optimal threshold matrix is one that for any possible quantisation of color has the minimum possible texture so that the greatest impression of the underlying feature comes from the image being quantised. It can be proven that for matrices whose side length is a power of two there is an optimal threshold matrix.[2] The map may be rotated or mirrored without affecting the effectiveness of the algorithm.
`
	const result = splitContent(content, 10, mime)
	expect(result).toEqual({
		plainTextChunks: [
			'The algorithm reduces the number colors applying threshold map the',
			'pixels displayed, causing some pixels change color, depending the distance',
			'the original color from the available color entries the reduced',
			'palette. The first threshold maps were designed hand minimise the',
			'perceptual difference between grayscale image and its two-bit quantisation for',
			'matrix. optimal threshold matrix one that for any possible quantisation',
			'color has the minimum possible texture that the greatest impression',
			'the underlying feature comes from the image being quantised. can',
			'proven that for matrices whose side length power two there',
			'optimal threshold matrix. The map may rotated mirrored without affecting',
			'the effectiveness the algorithm.'
		],
		mimeFormatChunks: [
			'\n' + 'The algorithm reduces the number of colors by applying a threshold map M to the',
			' pixels displayed, causing some pixels to change color, depending on the distance',
			' of the original color from the available color entries in the reduced',
			' palette.\nThe first threshold maps were designed by hand to minimise the',
			' perceptual difference between a grayscale image and its two-bit quantisation for',
			' up to a 4x4 matrix. [1]\n' +
				'An optimal threshold matrix is one that for any possible quantisation',
			' of color has the minimum possible texture so that the greatest impression',
			' of the underlying feature comes from the image being quantised. It can',
			' be proven that for matrices whose side length is a power of two there',
			' is an optimal threshold matrix.[2] The map may be rotated or mirrored without affecting',
			' the effectiveness of the algorithm.\n'
		]
	})
	expect(result.mimeFormatChunks.length === result.plainTextChunks.length).toBeTruthy()
})
