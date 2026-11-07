import { describe, expect, it } from "vitest";
import { clampOffset, getCoverLayout, getCropRect } from "./photoPosition";

describe("getCoverLayout", () => {
  it("phóng ảnh vừa phủ kín khung và đặt ở giữa", () => {
    expect(getCoverLayout({ width: 1000, height: 500 }, { width: 100, height: 100 })).toEqual({
      scale: 0.2,
      width: 200,
      height: 100,
      x: -50,
      y: 0,
    });
  });
});

describe("clampOffset", () => {
  const layout = { width: 200, height: 100 };
  const frame = { width: 100, height: 100 };

  it("không cho kéo làm lộ khoảng trống", () => {
    expect(clampOffset({ x: 30, y: 20 }, layout, frame)).toEqual({ x: 0, y: 0 });
    expect(clampOffset({ x: -500, y: -20 }, layout, frame)).toEqual({ x: -100, y: 0 });
  });

  it("giữ nguyên vị trí hợp lệ", () => {
    expect(clampOffset({ x: -40, y: 0 }, layout, frame)).toEqual({ x: -40, y: 0 });
  });
});

describe("getCropRect", () => {
  it("đổi vùng đang thấy về toạ độ của ảnh gốc", () => {
    expect(getCropRect({ x: -40, y: -10 }, 0.2, { width: 100, height: 100 })).toEqual({
      x: 200,
      y: 50,
      width: 500,
      height: 500,
    });
  });
});
