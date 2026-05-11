import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Input } from '../Input'

describe('Input', () => {
  it('renders label when provided', () => {
    render(<Input label="Email" />)
    expect(screen.getByText('Email')).toBeInTheDocument()
  })

  it('renders without label element when label prop omitted', () => {
    render(<Input placeholder="Enter text" />)
    expect(screen.queryByRole('label')).not.toBeInTheDocument()
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('renders error message', () => {
    render(<Input error="Required field" />)
    expect(screen.getByText('Required field')).toBeInTheDocument()
  })

  it('renders helperText when no error', () => {
    render(<Input helperText="We will never share your email" />)
    expect(screen.getByText('We will never share your email')).toBeInTheDocument()
  })

  it('error takes priority over helperText', () => {
    render(<Input error="Bad input" helperText="Some hint" />)
    expect(screen.getByText('Bad input')).toBeInTheDocument()
    expect(screen.queryByText('Some hint')).not.toBeInTheDocument()
  })

  it('type text has no password toggle button', () => {
    render(<Input type="text" />)
    expect(screen.queryByLabelText(/show password/i)).not.toBeInTheDocument()
  })

  it('type password shows toggle button', () => {
    render(<Input type="password" />)
    expect(screen.getByLabelText('Show password')).toBeInTheDocument()
  })

  it('password input is not accessible as role textbox', () => {
    render(<Input type="password" />)
    // password inputs are not role=textbox; they have no implicit ARIA role
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
  })

  it('password toggle changes input type on click', async () => {
    const { container } = render(<Input type="password" />)
    const input = container.querySelector('input') as HTMLInputElement
    expect(input.type).toBe('password')

    await userEvent.click(screen.getByLabelText('Show password'))
    expect(input.type).toBe('text')

    await userEvent.click(screen.getByLabelText('Hide password'))
    expect(input.type).toBe('password')
  })

  it('toggle button aria-label updates after click', async () => {
    render(<Input type="password" />)
    expect(screen.getByLabelText('Show password')).toBeInTheDocument()

    await userEvent.click(screen.getByLabelText('Show password'))
    expect(screen.getByLabelText('Hide password')).toBeInTheDocument()
  })
})
