
const prisma = require("./config/prisma");
const bcrypt = require("bcrypt");

async function resetAdminPassword() {
  try {
    const user = await prisma.users.findUnique({
      where: { id: 1 }
    });

    if (!user || user.email !== "vaishnavi@gmail.com" || user.role !== "ADMIN") {
      console.log("Admin account verification failed.");
      return;
    }

    const hashedPassword = await bcrypt.hash("Admin@123", 12);

    await prisma.users.update({
      where: { id: 1 },
      data: {
        email: "vaishnavi@gmail.com",
        password: hashedPassword
      }
    });

    console.log("Password updated successfully!");
    console.log("Hash length:", hashedPassword.length);
    console.log(
      "Password match:",
      await bcrypt.compare("Admin@123", hashedPassword)
    );

  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

resetAdminPassword();
