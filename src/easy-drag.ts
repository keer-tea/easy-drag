import {
  TVector,
  TVectorRange,
  addVector,
  minusVector,
  formatVector,
  setTranslatePosition,
  getPosition,
  isMobile,
} from "./utils";
interface IOptions {
  /** 拖拽范围元素 */
  outerElement?: HTMLElement;
  /** 拖拽图标元素 */
  innerElement?: HTMLElement;
  /** 拖拽开始的回调 */
  onDragStart?: (v: TVector) => void;
  /** 拖拽中的回调 */
  onDrag?: (v: TVector) => void;
  /** 拖拽结束的回调 */
  onDragEnd?: (v: TVector) => void;
}
/**
 * 用transform属性轻松实现拖拽效果
 */
export const enableDrag = (element: HTMLElement, options?: IOptions) => {
  let { outerElement, innerElement, onDragStart, onDrag, onDragEnd } =
    options ?? {};
  // 元素的transform属性值，getComputedStyle返回值为matrix3d形式
  // 初始值可能为"none"
  let startTransform = window.getComputedStyle(element).transform;
  // 拖拽开始时的鼠标位置
  let startPosition: TVector | null = null;
  // 拖拽结束时的鼠标位置
  let endPosition: TVector | null = null;
  // 拖拽位移向量范围
  let draggingMoveVectorRange: TVectorRange | null = null;
  // 元素位移向量（拖拽后修改）
  let draggedMoveVector: TVector = [0, 0];
  // 元素位移向量（拖拽时修改）
  let draggingMoveVector: TVector = [0, 0];
  // 拖拽范围元素
  outerElement = outerElement ?? document.body;
  // 拖拽的元素
  element = element;
  // 拖拽图标元素
  innerElement = innerElement ?? element;

  const onMouseDown = (e: MouseEvent | TouchEvent) => {
    e.stopPropagation();
    // 记录当前鼠标或触摸位置
    startPosition = getPosition(e);

    if (outerElement && element && innerElement) {
      // 每次点击记录拖拽位移向量范围
      const outerElementRect = outerElement.getBoundingClientRect();
      const elementRect = element.getBoundingClientRect();
      // 有点 A(1, 4)，点 B(2, 8)
      // A 到 B 的向量表示：（2 - 1, 8 - 4)
      draggingMoveVectorRange = [
        outerElementRect.top - elementRect.top,
        outerElementRect.bottom - elementRect.bottom,
        outerElementRect.left - elementRect.left,
        outerElementRect.right - elementRect.right,
      ];
    }
    typeof onDragStart === "function" && onDragStart(draggedMoveVector);
  };
  const onMouseMove = (e: MouseEvent | TouchEvent) => {
    if (startPosition && draggingMoveVectorRange) {
      // 当前鼠标或触摸位置
      endPosition = getPosition(e);

      // 本次的拖拽位移向量
      const currentMoveVector = formatVector(
        // 实际的位移向量
        minusVector(startPosition, endPosition),
        // 位移向量的范围
        draggingMoveVectorRange
      );
      // 之前的拖拽位移向量+本次的拖拽位移向量
      draggingMoveVector = addVector(draggedMoveVector, currentMoveVector);
      element.style.transform = setTranslatePosition(
        startTransform,
        draggingMoveVector
      );
      typeof onDrag === "function" && onDrag(draggingMoveVector);
    }
  };
  const onMouseUp = (e: MouseEvent | TouchEvent) => {
    if (startPosition && draggingMoveVectorRange) {
      draggedMoveVector = draggingMoveVector;
      typeof onDragEnd === "function" && onDragEnd(draggedMoveVector);
    }
    startPosition = null;
  };
  const addEventListener = () => {
    if (innerElement) {
      if (isMobile()) {
        innerElement.addEventListener("touchstart", onMouseDown);
        document.addEventListener("touchmove", onMouseMove);
        document.addEventListener("touchend", onMouseUp);
        return;
      }
      innerElement.addEventListener("mousedown", onMouseDown);
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    }
  };
  const removeEventListener = () => {
    if (innerElement) {
      if (isMobile()) {
        innerElement.removeEventListener("touchstart", onMouseDown);
        document.removeEventListener("touchmove", onMouseMove);
        document.removeEventListener("touchend", onMouseUp);
        return;
      }
      innerElement.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    }
  };
  addEventListener();
  return removeEventListener;
};
