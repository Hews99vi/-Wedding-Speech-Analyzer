import { render, screen } from '@testing-library/react'
import { Badge } from '../Badge'

describe('Badge', () => {
  it('renders children', () => {
    render(<Badge>Active</Badge>)
    expect(screen.getByText('Active')).toBeInTheDocument()
  })

  it('default variant applies default classes', () => {
    render(<Badge variant="default">Tag</Badge>)
    expect(screen.getByText('Tag')).toHaveClass('bg-surface-alt')
  })

  it('success variant applies success classes', () => {
    render(<Badge variant="success">OK</Badge>)
    expect(screen.getByText('OK')).toHaveClass('bg-success-50')
  })

  it('warning variant applies warning classes', () => {
    render(<Badge variant="warning">Warn</Badge>)
    expect(screen.getByText('Warn')).toHaveClass('bg-warning-50')
  })

  it('danger variant applies danger classes', () => {
    render(<Badge variant="danger">Error</Badge>)
    expect(screen.getByText('Error')).toHaveClass('bg-danger-50')
  })

  it('accepts additional className', () => {
    render(<Badge className="my-custom-class">Tag</Badge>)
    expect(screen.getByText('Tag')).toHaveClass('my-custom-class')
  })
})
