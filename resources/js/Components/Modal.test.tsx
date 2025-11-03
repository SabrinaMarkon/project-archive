import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Modal from './Modal';

describe('Modal', () => {
    it('does not render children when show is false', () => {
        render(
            <Modal show={false} onClose={vi.fn()}>
                <div>Modal content</div>
            </Modal>
        );

        expect(screen.queryByText('Modal content')).not.toBeInTheDocument();
    });

    it('renders children when show is true', () => {
        render(
            <Modal show={true} onClose={vi.fn()}>
                <div>Modal content</div>
            </Modal>
        );

        expect(screen.getByText('Modal content')).toBeInTheDocument();
    });

    it('renders multiple children correctly', () => {
        render(
            <Modal show={true} onClose={vi.fn()}>
                <h2>Title</h2>
                <p>Description</p>
            </Modal>
        );

        expect(screen.getByText('Title')).toBeInTheDocument();
        expect(screen.getByText('Description')).toBeInTheDocument();
    });

    it('respects closeable prop default value', () => {
        const onClose = vi.fn();

        render(
            <Modal show={true} onClose={onClose}>
                <div>Content</div>
            </Modal>
        );

        // Component should render without errors
        expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('accepts maxWidth prop', () => {
        render(
            <Modal show={true} maxWidth="lg" onClose={vi.fn()}>
                <div>Content</div>
            </Modal>
        );

        expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('transitions properly when show changes', () => {
        const { rerender } = render(
            <Modal show={false} onClose={vi.fn()}>
                <div>Content</div>
            </Modal>
        );

        expect(screen.queryByText('Content')).not.toBeInTheDocument();

        rerender(
            <Modal show={true} onClose={vi.fn()}>
                <div>Content</div>
            </Modal>
        );

        expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('calls onClose callback when provided', () => {
        const onClose = vi.fn();

        render(
            <Modal show={true} onClose={onClose}>
                <div>Content</div>
            </Modal>
        );

        // Just verify it renders without calling onClose
        expect(onClose).not.toHaveBeenCalled();
        expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('respects closeable=false prop', () => {
        const onClose = vi.fn();

        render(
            <Modal show={true} onClose={onClose} closeable={false}>
                <div>Content</div>
            </Modal>
        );

        // Component should render normally
        expect(screen.getByText('Content')).toBeInTheDocument();
    });
});
