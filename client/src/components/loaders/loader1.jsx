import React from 'react';
import styled from 'styled-components';
import { Spinner } from '../ui/spinner';

const Loader1 = ({ text = "Loading..." }) => {
  return (
    <StyledWrapper className='flex justify-center items-center h-screen w-screen'>
      <div className="loader-wrapper flex gap-2 justify-center items-center">
        <Spinner className={"size-6 text-orange-500"} />
        <div className="letter-wrapper space-y-0.5">
          {[...text].map((letter, index) => {
            return <span key={index} className="loader-letter">{letter}</span>
          })}
        </div>
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .loader-wrapper {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #262626;
    user-select: none;
  }
  
  .letter-wrapper {
    display: flex;
    gap: 1px;
  }
  .loader-letter {
    display: inline-block;
    opacity: 0.4;
    transform: translateY(0);
    animation: loader-letter-anim 2s infinite;
    z-index: 1;
    border-radius: 50ch;
    border: none;
  }

  .loader-letter:nth-child(1) {
    animation-delay: 0s;
  }
  .loader-letter:nth-child(2) {
    animation-delay: 0.1s;
  }
  .loader-letter:nth-child(3) {
    animation-delay: 0.2s;
  }
  .loader-letter:nth-child(4) {
    animation-delay: 0.3s;
  }
  .loader-letter:nth-child(5) {
    animation-delay: 0.4s;
  }
  .loader-letter:nth-child(6) {
    animation-delay: 0.5s;
  }
  .loader-letter:nth-child(7) {
    animation-delay: 0.6s;
  }
  .loader-letter:nth-child(8) {
    animation-delay: 0.7s;
  }
  .loader-letter:nth-child(9) {
    animation-delay: 0.8s;
  }
  .loader-letter:nth-child(10) {
    animation-delay: 0.9s;
  }

  @keyframes loader-letter-anim {
    0%,
    100% {
      opacity: 0.4;
      transform: translateY(0);
    }
    20% {
      opacity: 1;
      transform: scale(1.15);
    }
    40% {
      opacity: 0.7;
      transform: translateY(0);
    }
  }`;

export default Loader1;
