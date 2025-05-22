import { useMouse, useMouseInElement, useMousePressed, useSwipe, type MaybeElementRef, type UseSwipeDirection } from "@vueuse/core";

export function useMouseAndTouchSwipe(target: Ref<HTMLElement | undefined>) {
    const { isSwiping: touchIsSwiping, direction: touchDirection, lengthX: touchLengthX } = useSwipe(target);
    const { x, isOutside } = useMouseInElement(target, { touch: false });
    const { pressed } = useMousePressed({ touch: false });

    const isSwiping = ref(false);
    const direction = ref<UseSwipeDirection>('none');
    const lengthX = ref(0);

    const xStart = ref(0);

    watch(touchIsSwiping, (_isSwiping) => {
        isSwiping.value = _isSwiping;
    });

    watch(touchDirection, (_direction) => {
        direction.value = _direction;
    });

    watch(touchLengthX, (_lengthX) => {
        lengthX.value = _lengthX;
    });

    watch(pressed, async (_pressed) => {
        if (_pressed) {
            xStart.value = x.value;
        } else {
            isSwiping.value = false;
            await nextTick();
            direction.value = 'none';
            lengthX.value = 0;
        }
    });

    watch([x], ([_x]) => {
        if (pressed.value && !isOutside.value) {
            lengthX.value = xStart.value - _x;

            if (lengthX.value > 0) {
                isSwiping.value = true;
                direction.value = 'right';
            } else if (lengthX.value < 0) {
                isSwiping.value = true;
                direction.value = 'left';
            }
        }
    });

    return {
        isSwiping,
        direction,
        lengthX,
    }
}