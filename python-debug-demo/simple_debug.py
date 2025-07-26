#!/usr/bin/env python3
"""
Simple Python script for testing Copilot Debug Tool
Perfect for beginners to learn debugging with breakpoints
"""

def calculate_squares(numbers):
    """Calculate squares of numbers in a list"""
    results = []
    sum_total = 0
    
    for num in numbers:
        square = num * num
        sum_total += square
        results.append({
            'number': num,
            'square': square,
            'running_total': sum_total
        })
        print(f"Number: {num}, Square: {square}, Total so far: {sum_total}")
    
    return results, sum_total

def fibonacci_simple(n):
    """Generate first n Fibonacci numbers"""
    if n <= 0:
        return []
    elif n == 1:
        return [0]
    elif n == 2:
        return [0, 1]
    
    fib_sequence = [0, 1]
    for i in range(2, n):
        next_fib = fib_sequence[i-1] + fib_sequence[i-2]
        fib_sequence.append(next_fib)
    
    return fib_sequence

def main():
    """Main function - perfect for debugging practice"""
    print("=== Simple Debug Demo ===")
    
    # Test data for debugging
    numbers = [2, 3, 4, 5]
    
    print(f"Input numbers: {numbers}")
    
    # Calculate squares - SET BREAKPOINT at line 20 (for loop)
    results, total = calculate_squares(numbers)
    
    print(f"Results: {results}")
    print(f"Total of all squares: {total}")
    
    # Generate Fibonacci sequence - SET BREAKPOINT at line 60 (for loop)  
    fib_count = 8
    fibonacci_nums = fibonacci_simple(fib_count)
    
    print(f"First {fib_count} Fibonacci numbers: {fibonacci_nums}")
    
    # Final calculations
    average_square = total / len(numbers)
    print(f"Average square: {average_square}")

if __name__ == "__main__":
    main()
