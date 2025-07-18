import { mount } from '@vue/test-utils'
import InputStepper from '../components/InputStepper.vue'
import { describe, it, expect } from 'vitest'

describe('InputStepper', () => {
  it('renders properly', () => {
    const wrapper = mount(InputStepper)
    expect(wrapper.exists()).toBe(true)
  })
})
