const fs = require("fs");
const path = require("path");
const {
    loadGameData,
    saveGameData,
    resetGameData,
    createDefaultGameDataIfMissing,
} = require("../src/dataManager");

const TEST_DIR = path.join(__dirname, "temp_test_data");

beforeAll(() => {
    if (!fs.existsSync(TEST_DIR)) {
        fs.mkdirSync(TEST_DIR);
    }
});

afterAll(() => {
    if (fs.existsSync(TEST_DIR)) {
        fs.rmSync(TEST_DIR, { recursive: true, force: true });
    }
});

beforeEach(() => {
    // Clean up before each test
    const file = path.join(TEST_DIR, "playerData.json");
    if (fs.existsSync(file)) {
        fs.unlinkSync(file);
    }
});

test("createDefaultGameDataIfMissing creates file with defaults", () => {
    createDefaultGameDataIfMissing(TEST_DIR);
    const data = loadGameData(TEST_DIR);
    expect(data).not.toBeNull();
    expect(data.levels).toBeDefined();
    expect(data.ships).toBeDefined();
    expect(data.player).toBeNull();
});

test("saveGameData and loadGameData work correctly", () => {
    const dummyData = { player: { name: "Test" }, levels: [] };
    saveGameData(TEST_DIR, dummyData);
    const loaded = loadGameData(TEST_DIR);
    expect(loaded).toEqual(dummyData);
});

test("resetGameData deletes the file", () => {
    const dummyData = { foo: "bar" };
    saveGameData(TEST_DIR, dummyData);
    expect(loadGameData(TEST_DIR)).not.toBeNull();

    resetGameData(TEST_DIR);
    expect(loadGameData(TEST_DIR)).toBeNull();
});
