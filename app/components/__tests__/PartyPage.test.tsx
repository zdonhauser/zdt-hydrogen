import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '~/test/test-utils'
import PartyPage from '../PartyPage'

// Mock the AnimatedBackground component to avoid animation complexities in tests
vi.mock('~/components/AnimatedBackground', () => ({
  AnimatedBackground: ({ text }: { text: string }) => (
    <div data-testid="animated-background">{text}</div>
  ),
}))

describe('PartyPage Component', () => {
  it('renders the main heading and description', () => {
    render(<PartyPage />)
    
    expect(screen.getByRole('heading', { name: /party rooms/i })).toBeInTheDocument()
    expect(screen.getByText(/rent out a party room for your next birthday party/i)).toBeInTheDocument()
  })

  it('displays all party room options', () => {
    render(<PartyPage />)
    
    // Check for all party room names
    expect(screen.getByText('Carousel Party Room')).toBeInTheDocument()
    expect(screen.getByText('Large Party Room')).toBeInTheDocument()
    expect(screen.getByText('Midway Point Party Station')).toBeInTheDocument()
    expect(screen.getByText('Turning Point Party Station')).toBeInTheDocument()
  })

  it('shows pricing information for all rooms', () => {
    render(<PartyPage />)
    
    // Check for pricing display
    expect(screen.getAllByText('$32/Wristband')).toHaveLength(3) // Carousel, Large, Midway
    expect(screen.getByText('$30/Wristband')).toBeInTheDocument() // Turning Point
    
    // Check for minimum requirements
    expect(screen.getByText('Min 8')).toBeInTheDocument() // Carousel
    expect(screen.getByText('Min 10')).toBeInTheDocument() // Large
    expect(screen.getByText('Min 25')).toBeInTheDocument() // Midway
    expect(screen.getByText('Min 75')).toBeInTheDocument() // Turning Point
  })

  it('displays food options section', () => {
    render(<PartyPage />)
    
    expect(screen.getByRole('heading', { name: /food options/i })).toBeInTheDocument()
    expect(screen.getByText('Pizza Based on Party Attendance')).toBeInTheDocument()
    expect(screen.getByText('Whole Pizzas (10 Slices)')).toBeInTheDocument()
  })

  it('has navigation links to party booking', () => {
    render(<PartyPage />)
    
    // Check that party booking links exist
    const links = screen.getAllByRole('link')
    const bookingLinks = links.filter(link => 
      link.getAttribute('href')?.includes('/collections/party-booking')
    )
    
    expect(bookingLinks.length).toBeGreaterThan(0)
    
    // Check specific Carousel room link
    const carouselLink = links.find(link => 
      link.getAttribute('href')?.includes('/collections/party-booking?room=Carousel')
    )
    expect(carouselLink).toBeTruthy()
  })

  it('displays important policy information', () => {
    render(<PartyPage />)
    
    expect(screen.getByText(/\$60 non-refundable deposit/i)).toBeInTheDocument()
    expect(screen.getByText(/children ages 3-15 require wristbands/i)).toBeInTheDocument()
  })

  it('has printable invitation buttons', () => {
    render(<PartyPage />)
    
    expect(screen.getByRole('button', { name: /switchback style/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /jungleland style/i })).toBeInTheDocument()
  })

  it('renders party room images', () => {
    render(<PartyPage />)
    
    const carouselImage = screen.getByAltText('Carousel Party Room')
    expect(carouselImage).toBeInTheDocument()
    expect(carouselImage).toHaveAttribute('src')
    
    const largeImage = screen.getByAltText('Large Party Room')
    expect(largeImage).toBeInTheDocument()
    expect(largeImage).toHaveAttribute('src')
  })
})