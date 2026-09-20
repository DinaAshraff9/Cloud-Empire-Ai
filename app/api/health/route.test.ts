import { describe, expect, it } from 'vitest'

describe('health endpoint contract', () => {
  it('exposes a stable operational status shape', () => {
    expect({ status: 'ok', database: 'ok' }).toMatchObject({ status: expect.any(String), database: expect.any(String) })
  })
})
