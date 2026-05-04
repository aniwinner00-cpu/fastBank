const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../Models/userModel");
const Bvn = require("../Models/bvnModel");
const Nin = require("../Models/ninModel");
const nibssService = require("../services/nibssService");
const Account = require("../Models/accountModel");

const registerUser = async (req, res) => {
    try {
        const {
            firstName,
            middleName,
            lastName,
            email,
            phone,
            password,
            bvn,
            nin,
            dob
        } = req.body;

        if (!bvn && !nin) {
            return res.status(400).json({
                message: "BVN or NIN is required"
            });
        }

        const existingUser = await User.findOne({
            $or: [
                { email },
                { phone },
                ...(bvn ? [{ bvn }] : []),
                ...(nin ? [{ nin }] : [])
            ]
        });

        if (existingUser) {
            return res.status(409).json({
                message: "User already exists"
            });
        }

         

        let validatedDOB = dob;

        if (bvn) {
            const bvnData = await nibssService.validateBVN(bvn);
            console.log("BVN Validation Response:", bvnData);

            await Bvn.findOneAndUpdate(
                { bvn },
                { ...bvnData.data, bvn },
                { upsert: true, returnDocument: "after" }
            );

            validatedDOB = bvnData.data?.dob || bvnData.dob || validatedDOB;
        }

        if (nin) {
            const ninData = await nibssService.validateNIN(nin);

            await Nin.findOneAndUpdate(
                { nin },
                { ...ninData.data, nin },
                { upsert: true, returnDocument: "after" }
            );

            validatedDOB = ninData.data?.dob || ninData.dob || validatedDOB;
        }
 
          validatedDOB = new Date(validatedDOB).toISOString().split("T")[0];

        const kycType = bvn ? "bvn" : "nin";
        const kycID = bvn || nin;

        console.log("Generated account payload:", {
         kycType,
          kycID,
         dob: validatedDOB
           });

         
         const token = await nibssService.loginNibss();
         console.log("NIBSS Token:", token);

         const accountData = await nibssService.createAccount(
            kycType,
            kycID,
            validatedDOB,
            token
        );

        console.log("Full Account Creation Response:", accountData);

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            firstName,
            middleName,
            lastName,
            email,
            phone,
            password: hashedPassword,
             bvn,
            nin,
            dob: validatedDOB,
            accountNumber: accountData.account.accountNumber,
            isVerified: true
        });
 

await Account.create({
    userId: user._id,
    accountNumber: accountData.account.accountNumber,
    accountName: `${user.firstName} ${user.lastName}`,
    bankCode: accountData.account.bankCode,
    bankName: "Fast Bank Limited",
    balance: accountData.account.balance || 0,
    kycType: kycType.toLowerCase(),
    kycID
});

        return res.status(201).json({
            message: "User registered successfully",
            data: {
                firstName: user.firstName,
                middleName: user.middleName,
                lastName: user.lastName,
                fullName: user.fullName,
                email: user.email,
                phone: user.phone,
                accountNumber: user.accountNumber,
                createdAt: user.createdAt
            }
        });

    }     catch (error) {
        console.error("Full NIBSS Account Error:", error.response?.data || error.message);

        return res.status(500).json({
            message:
                error.response?.data?.message ||
                error.message ||
                "Account creation failed"
        });
    }
};

// Login User
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({
                message: "Invalid credentials"
            });
        }

        const token = jwt.sign(
            {
                userId: user._id,
                email: user.email
            },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );
        

const account = await Account.findOne({
    userId: user._id
});

let balance = null;

if (account) {
    const nibssToken = await nibssService.loginNibss();

    const balanceData = await nibssService.checkBalance(
        account.accountNumber,
        nibssToken
    );

    balance = balanceData.data?.balance || account.balance;
}

       res.status(200).json({
    message: "Login successful",
    token,
    data: {
        fullName: user.fullName,
        accountNumber: account?.accountNumber,
        balance
    }
});

    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
};

const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select("-password");

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        return res.status(200).json(user);

    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
};


module.exports = {
    registerUser,
    loginUser,
    getProfile
};