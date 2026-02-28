import React, { useState, useRef, TouchEvent } from 'react'
import styled from 'styled-components'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface CarouselProps {
  items: React.ReactNode[]
  enableSwipe?: boolean
}

const CarouselContainer = styled.div`
  position: relative;
  width: 100%;
  overflow: hidden;
`

const NavButton = styled.button`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: ${({ theme }) => theme.transitions.fast};
  
  &:hover {
    background: ${({ theme }) => theme.colors.primaryDark};
    transform: translateY(-50%) scale(1.05);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    width: 36px;
    height: 36px;
    
    svg {
      width: 18px;
      height: 18px;
    }
  }
`

const LeftButton = styled(NavButton)`
  left: 12px;
`

const RightButton = styled(NavButton)`
  right: 12px;
`

const DotContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-top: ${({ theme }) => theme.spacing.lg};
`

const Dot = styled.button<{ active: boolean }>`
  width: 10px;
  height: 10px;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  border: none;
  background: ${({ theme, active }) => active ? theme.colors.primary : theme.colors.mediumGray};
  cursor: pointer;
  transition: ${({ theme }) => theme.transitions.fast};
  
  &:hover {
    background: ${({ theme }) => theme.colors.primary};
  }
`

export const Carousel: React.FC<CarouselProps> = ({
  items,
  enableSwipe = true
}) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const touchStartX = useRef(0)
  const touchEndX = useRef(0)

  const canSlideLeft = currentIndex > 0
  const canSlideRight = currentIndex < items.length - 1

  const handleNext = () => {
    if (canSlideRight) {
      setCurrentIndex(prev => prev + 1)
    }
  }

  const handlePrev = () => {
    if (canSlideLeft) {
      setCurrentIndex(prev => prev - 1)
    }
  }

  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    touchStartX.current = e.targetTouches[0].clientX
  }

  const handleTouchEnd = (e: TouchEvent<HTMLDivElement>) => {
    touchEndX.current = e.changedTouches[0].clientX
    handleSwipe()
  }

  const handleSwipe = () => {
    if (!enableSwipe) return
    
    const swipeThreshold = 50
    const diff = touchStartX.current - touchEndX.current

    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        handleNext()
      } else {
        handlePrev()
      }
    }
  }

  React.useEffect(() => {
    return () => {}
  }, [items.length])

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  }

  const swipeConfidenceThreshold = 10000
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity
  }

  return (
    <CarouselContainer
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <AnimatePresence initial={false} mode="wait">
        <motion.div
          key={currentIndex}
          custom={1}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: 'spring', stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 }
          }}
          drag="x"
          dragElastic={1}
          dragConstraints={{ left: 0, right: 0 }}
          onDragEnd={(_, { offset, velocity }) => {
            const swipe = swipePower(offset.x, velocity.x)

            if (swipe < -swipeConfidenceThreshold && canSlideRight) {
              handleNext()
            } else if (swipe > swipeConfidenceThreshold && canSlideLeft) {
              handlePrev()
            }
          }}
          style={{
            width: '100%'
          }}
        >
          {items[currentIndex]}
        </motion.div>
      </AnimatePresence>

      <LeftButton
        onClick={handlePrev}
        disabled={!canSlideLeft}
        aria-label="Previous slide"
      >
        <ChevronLeft size={20} />
      </LeftButton>

      <RightButton
        onClick={handleNext}
        disabled={!canSlideRight}
        aria-label="Next slide"
      >
        <ChevronRight size={20} />
      </RightButton>

      {items.length > 1 && (
        <DotContainer>
          {items.map((_, index) => (
            <Dot
              key={index}
              active={index === currentIndex}
              onClick={() => setCurrentIndex(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </DotContainer>
      )}
    </CarouselContainer>
  )
}

export default Carousel
