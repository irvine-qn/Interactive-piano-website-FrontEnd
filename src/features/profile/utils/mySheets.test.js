import { describe, expect, it } from "vitest";
import { mergeSheets, nextPageToLoad, toEditDetails, toSheetUpdate } from "./mySheets";

describe("nextPageToLoad", () => {
  it("lấy trang kế tiếp khi đã tải đủ các trang", () => {
    expect(nextPageToLoad(20, 20)).toBe(2);
    expect(nextPageToLoad(40, 20)).toBe(3);
  });

  it("sau khi xoá 1 bài thì tải lại trang hiện tại để không sót bài bị dồn lên", () => {
    expect(nextPageToLoad(19, 20)).toBe(1);
    expect(nextPageToLoad(39, 20)).toBe(2);
  });
});

describe("mergeSheets", () => {
  it("nối bài mới, bỏ bài đã có", () => {
    const merged = mergeSheets([{ id: "a" }, { id: "b" }], [{ id: "b" }, { id: "c" }]);
    expect(merged.map((sheet) => sheet.id)).toEqual(["a", "b", "c"]);
  });
});

describe("toEditDetails / toSheetUpdate", () => {
  const sheet = {
    id: "a",
    title: "Song",
    composer: "Bach",
    difficulty: "EASY",
    tags: ["Pop"],
    coverColor: "mint",
    visibility: "PRIVATE",
    notes: [],
  };

  it("form chỉ giữ các trường sửa được", () => {
    expect(toEditDetails(sheet)).toEqual({
      title: "Song",
      composer: "Bach",
      difficulty: "EASY",
      tags: ["Pop"],
      coverColor: "mint",
      visibility: "PRIVATE",
    });
  });

  it("gộp khoảng trắng trước khi gửi và không gửi trường khác", () => {
    expect(toSheetUpdate({ ...toEditDetails(sheet), title: "  New   name ", composer: " " })).toEqual({
      title: "New name",
      composer: "",
      difficulty: "EASY",
      tags: ["Pop"],
      coverColor: "mint",
      visibility: "PRIVATE",
    });
  });
});
