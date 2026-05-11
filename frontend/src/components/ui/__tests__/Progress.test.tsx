import { render, container } from '@testing-library/react'
import { Progress } from '../Progress'

function getInnerBar(c: HTMLElement) {
  return c.querySelector('.bg-brand-500') as HTMLElement
}

describe('Progress', () => {
  it('renders at given percentage', () => {
    const { container: c } = render(<Progress value={50} />)
    expect(getInnerBar(c).style.width).toBe('50%')
  })

  it('clamps value above 100 to 100%', () => {
    const { container: c } = render(<Progress value={150} />)
    expect(getInnerBar(c).style.width).toBe('100%')
  })

  it('clamps value below 0 to 0%', () => {
    const { container: c } = render(<Progress value={-10} />)
    expect(getInnerBar(c).style.width).toBe('0%')
  })

  it('renders at 0 correctly', () => {
    const { container: c } = render(<Progress value={0} />)
    expect(getInnerBar(c).style.width).toBe('0%')
  })

  it('renders at 100 correctly', () => {
    const { container: c } = render(<Progress value={100} />)
    expect(getInnerBar(c).style.width).toBe('100%')
  })
})
