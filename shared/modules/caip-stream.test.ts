import {
  createCaipStream,
  SplitStream,
  CaipToMultiplexStream,
  MultiplexToCaipStream,
} from './caip-stream'
import { deferredPromise } from '../../app/scripts/lib/util'
import { PassThrough } from 'readable-stream'
import { WriteStream } from 'fs'

describe('CAIP Stream', () => {
  describe('SplitStream', () => {
    it('redirects writes from the main stream to the substream', async () => {
      const splitStream = new SplitStream()

      const outerStreamChunks: unknown[] = []
      splitStream.on('data', (chunk: unknown) => {
        outerStreamChunks.push(chunk)
      })

      const innerStreamChunks: unknown[] = []
      splitStream.substream.on('data', (chunk: unknown) => {
        innerStreamChunks.push(chunk)
      })

      const {
        promise: isWritten,
        resolve: writeCallback,
      } = deferredPromise();

      splitStream.write({foo: 'bar'}, writeCallback)

      await isWritten
      expect(outerStreamChunks).toStrictEqual([])
      expect(innerStreamChunks).toStrictEqual([{foo: 'bar'}])
    })

    it('redirects writes from the substream to the main stream', async () => {
      const splitStream = new SplitStream()

      const outerStreamChunks: unknown[] = []
      splitStream.on('data', (chunk: unknown) => {
        outerStreamChunks.push(chunk)
      })

      const innerStreamChunks: unknown[] = []
      splitStream.substream.on('data', (chunk: unknown) => {
        innerStreamChunks.push(chunk)
      })

      const {
        promise: isWritten,
        resolve: writeCallback,
      } = deferredPromise();

      splitStream.substream.write({foo: 'bar'}, writeCallback)

      await isWritten
      expect(outerStreamChunks).toStrictEqual([{foo: 'bar'}])
      expect(innerStreamChunks).toStrictEqual([])
    })
  })
})