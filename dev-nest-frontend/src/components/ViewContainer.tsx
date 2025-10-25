import type { ComponentPropsWithoutRef, ElementType, ReactNode } from 'react'

type ViewContainerProps<T extends ElementType> = {
  as?: T
  className?: string
  children: ReactNode
} & Omit<ComponentPropsWithoutRef<T>, 'as' | 'className' | 'children'>

const baseClasses =
  'mx-auto w-full max-w-5xl px-4 sm:px-6 lg:max-w-6xl lg:px-8 xl:max-w-7xl'

const ViewContainer = <T extends ElementType = 'div'>({
  as,
  className,
  children,
  ...props
}: ViewContainerProps<T>) => {
  const Component = as ?? 'div'
  const mergedClassName = className
    ? `${baseClasses} ${className}`
    : baseClasses

  return (
    <Component className={mergedClassName} {...(props as ComponentPropsWithoutRef<T>)}>
      {children}
    </Component>
  )
}

export default ViewContainer
